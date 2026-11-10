import { NextFunction, Request, Response } from "express";
import { getEnv } from "../config/env";
import {
  // order as ordersTable,
  orders,
  orderItems,
  products,
  user,
  UserRole,
  reviews,
  productImages,
} from "../drizzle/schema";
import { isStaff } from "../lib/roles";
import { db } from "../drizzle/db";
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import { escapeLike } from "../lib/utils";
import {
  getStreamChatServer,
  streamChatDisplayName,
  streamUserId,
} from "../lib/stream";
import { ExtendedChannelData } from "../config/type-schemas";
import { ApiError } from "../lib/api-error";
import { canTransition } from "../lib/order-status";
import {
  manageOrdersQuerySchema,
  orderIdParamSchema,
  updateFulfillmentSchema,
} from "../validators/order.validators";
import { sendOrderShippedEmail } from "../lib/order-emails";

const ENV = getEnv();

/* GET ALL ORDERS */
export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.session!.user;

    const rows = isStaff(user?.role as UserRole)
      ? await db.select().from(orders).orderBy(desc(orders.createdAt))
      : await db.select().from(orders).where(eq(orders.userId, user.id));

    const orderIds = rows.map((order) => {
      return order.id;
    });

    // create the order Map
    const previewByOrder = new Map();

    // generate inner join to get orders & product details
    if (orderIds.length > 0) {
      const itemRows = await db
        .select({
          orderId: orderItems.orderId,
          quantity: orderItems.quantity,
          name: products.name,
          slug: products.slug,
          imageUrl: sql<
            string | null
          >`(select pi.url from product_images pi where pi.product_id = ${products.id} order by pi.is_primary desc, pi."order" asc limit 1)`,
        })
        .from(orderItems)
        .innerJoin(products, eq(orderItems.productId, products.id))
        .where(inArray(orderItems.orderId, orderIds))
        .orderBy(asc(orderItems.id));

      // generate loop for displaying
      for (const row of itemRows) {
        const list = previewByOrder.get(row.orderId) ?? [];
        list.push({
          name: row.name,
          slug: row.slug,
          quantity: row.quantity,
          imageUrl: row.imageUrl,
        });
        previewByOrder.set(row.orderId, list);
      }
    }
    const ordersPayload = rows.map((order) => {
      const result = {
        ...order,
        previewItems: previewByOrder.get(order.id) ?? [],
      };
      return result;
    });
    res.status(200).json({ orders: ordersPayload });
  } catch (err) {
    next(err);
  }
};

/* GET SINGLE ORDER BY ID */
/* requireAuth (order.router.ts) guarantees req.session is set below. Ownership-or-staff still has to happen here: it needs the order row first to know who owns it, which requireStaff/requireRole can't check. */
export const getSingleOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.session!.user;
    const [singleOrder] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, req.params.id as string))
      .limit(1);
    if (!singleOrder) {
      res.status(404).json({ error: "Order not found!!" });
      return;
    }
    const canAccess =
      singleOrder.userId === user.id || isStaff(user?.role as UserRole);
    if (!canAccess) {
      res
        .status(403)
        .json({ error: "Forbidden: You don't have access to this order" });
      return;
    }
    // inner join to get the product information
    const items = await db.query.orderItems.findMany({
      where: eq(orderItems.orderId, singleOrder.id),
      with: {
        product: {
          with: {
            images: { orderBy: asc(productImages.order) },
            category: true,
          },
        },
      },
    });

    const isOwner = singleOrder.userId === user.id;
    const myRatings =
      isOwner && items.length > 0
        ? await db
            .select({ productId: reviews.productId, rating: reviews.rating })
            .from(reviews)
            .where(
              and(
                eq(reviews.userId, user.id),
                inArray(
                  reviews.productId,
                  items.map((item) => {
                    return item.productId;
                  }),
                ),
              ),
            )
        : [];

    const ratingByProduct = new Map(
      myRatings.map((row) => {
        return [row.productId, row.rating];
      }),
    );

    res.status(200).json({
      singleOrder: singleOrder,
      canRate:
        isOwner &&
        singleOrder.status === "paid" &&
        singleOrder.fulfillmentStatus !== "cancelled",
      items: items.map((item) => {
        return {
          id: item.id,
          quantity: item.quantity,
          unitPriceCents: item.unitPriceCents,
          product: item.product,
          myRating: ratingByProduct.get(item.product.id) ?? null,
        };
      }),
    });
  } catch (error) {
    next(error);
  }
};

/* CREATE STREAM CHANNEL */
/* requireAuth (order.router.ts) guarantees req.session is set below. Owner-or-staff still has to happen here, same reasoning as getSingleOrder. */
export const createStreamChannel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = req.session!.user;
    const server = getStreamChatServer(ENV);
    const [orderDetail] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, req.params.id as string))
      .limit(1);
    if (!orderDetail) {
      res.status(404).json({ error: "Order not found!" });
      return;
    }
    const isOwner = orderDetail.userId === user.id;
    if (!isOwner && !isStaff(user.role as UserRole)) {
      res.status(401).json({ error: "Not authorized" });
      return;
    }
    if (orderDetail.status !== "paid") {
      res
        .status(403)
        .json({ error: "Order must be paid to open support chat" });
      return;
    }
    const streamChatUserId = streamUserId(user?.id);
    await server.upsertUser({
      id: streamChatUserId,
      name: streamChatDisplayName(user?.role, user?.name, user?.email),
    });
    const channelId = `order-${orderDetail.id}`;
    const channel = server.channel("messaging", channelId, {
      name: `Support - order ${orderDetail.id.slice(0, 8)}`,
      created_by_id: streamChatUserId,
    } as any);
    await channel.create();
    await channel.addMembers([streamChatUserId]);
    res.json({
      channelType: "messaging",
      channelId: channelId,
      streamUserId: streamChatUserId,
    });
  } catch (error) {
    next(error);
  }
};

/* VIDEO INVITE */
/* requireAuth + requireStaff (order.router.ts) guarantee req.session is set and the caller is staff — no ownership check needed, so nothing to re-verify here beyond what the route already gated. */
export const createVideoInvite = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userData = req.session!.user;
    const server = getStreamChatServer(ENV);

    const [orderDetails] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, req.params.id as string))
      .limit(1);
    if (!orderDetails || orderDetails.status !== "paid") {
      res.status(404).json({ error: "Order not found or not paid!!" });
      return;
    }
    const [owner] = await db
      .select()
      .from(user)
      .where(eq(user.id, orderDetails.userId))
      .limit(1);
    const customerSid = streamUserId(owner.id);
    await server.upsertUser({
      id: customerSid,
      name: owner.name ?? owner.email ?? "Customer",
    });
    const staffStreamUserId = streamUserId(userData.id);
    await server.upsertUser({
      id: staffStreamUserId,
      name: streamChatDisplayName(userData.role, userData.name, userData.email),
    });
    const channelId = `order-${orderDetails.id}`;
    const channel = server.channel("messaging", channelId, {
      name: `Support - order ${orderDetails.id.slice(0, 8)}`,
      created_by_id: customerSid,
    } as ExtendedChannelData);
    await channel.create();
    await channel.addMembers([customerSid, staffStreamUserId]);
    const joinUrl = `${ENV.FRONTEND_URL.replace(/\/+$/, "")}/orders/${orderDetails.id}/call`;
    await channel.sendMessage({
      text: `Video call - tap Join below (same link for everyone): ${joinUrl}`,
      user_id: staffStreamUserId,
      custom: {
        video_invite: true,
        join_url: joinUrl,
      },
    } as any);
    res.json({ ok: true, joinUrl: joinUrl });
  } catch (error) {
    next(error);
  }
};

/* PATCH /api/orders/:id/fulfillment - staff only (requireStaff in the router) */
export const updateFulfillmentHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = orderIdParamSchema.parse(req.params);
    const { status, trackingNumber } = updateFulfillmentSchema.parse(req.body);
    const updated = await db.transaction(async (tx) => {
      // Lock the order row so two staff clicking at once can't both pass the transition check
      const [current] = await tx
        .select()
        .from(orders)
        .where(eq(orders.id, id))
        .for("update");
      if (!current) {
        throw new ApiError(409, "Order not found");
      }
      if (current.status !== "paid") {
        throw new ApiError(409, "Only paid orders can be fulfilled");
      }
      if (!canTransition(current.fulfillmentStatus, status)) {
        throw new ApiError(
          409,
          `Cannot move an order from ${current.fulfillmentStatus} to ${status}`,
        );
      }
      // Cancelling puts the units back on the shelf
      if (status === "cancelled") {
        const lines = await tx
          .select({
            producetId: orderItems.productId,
            quantity: orderItems.quantity,
          })
          .from(orderItems)
          .where(eq(orderItems.orderId, id))
          .orderBy(asc(orderItems.productId));
        for (const line of lines) {
          await tx
            .update(products)
            .set({ stock: sql`${products.stock} + ${line.quantity}` })
            .where(eq(products.id, line.producetId));
        }
      }
      const now = new Date();
      const shippingNow =
        status === "shipped" && current.fulfillmentStatus === "processing";

      const [row] = await tx
        .update(orders)
        .set({
          fulfillmentStatus: status,
          updatedAt: now,
          ...(status === "shipped"
            ? { shippedAt: now, trackingNumber: trackingNumber ?? null }
            : {}),
          ...(status === "delivered" ? { deliveredAt: now } : {}),
          // stepping back clears what the later steps recorded
          ...(status === "unfulfilled" || status === "processing"
            ? { shipped: null, trackingNumber: null }
            : {}),
          ...(status !== "delivered" ? { deliveredAt: null } : {}),
        })
        .where(eq(orders.id, id))
        .returning();
      return row;
    });
    res.json({ order: updated });
    if (status === "shipped") {
      void sendOrderShippedEmail(id);
    }
  } catch (err) {
    next(err);
  }
};

/* GET /api/orders/manage - staff only. Paginated, fileterable, searchable */
export const listManagedOrdersHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { page, limit, payment, fulfillment, q } =
      manageOrdersQuerySchema.parse(req.query);
    const offset = (page - 1) * limit;

    const conditions: SQL[] = [];
    if (payment) {
      conditions.push(eq(orders.status, payment));
    }
    if (fulfillment) {
      conditions.push(eq(orders.fulfillmentStatus, fulfillment));
    }
    if (q) {
      const pattern = `%${escapeLike(q)}%`;
      conditions.push(
        or(
          ilike(orders.shipFullName, pattern),
          ilike(orders.shipPhone, pattern),
          ilike(user.name, pattern),
          ilike(user.email, pattern),
          sql`${orders.id}::text ilike ${pattern}`,
        )!,
      );
    }
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, [{ total }]] = await Promise.all([
      db
        .select({
          id: orders.id,
          status: orders.status,
          fulfillmentStatus: orders.fulfillmentStatus,
          totalCents: orders.totalCents,
          currency: orders.currency,
          createdAt: orders.createdAt,
          shipFullName: orders.shipFullName,
          shipCity: orders.shipCity,
          customerName: user.name,
          customerEmail: user.email,
        })
        .from(orders)
        .innerJoin(user, eq(orders.userId, user.id))
        .where(where)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset),
      db
        .select({ total: sql<number>`count(*)::int` })
        .from(orders)
        .innerJoin(user, eq(orders.userId, user.id))
        .where(where),
    ]);
    res.json({
      orders: rows,
      pagination: {
        page: page,
        limit: limit,
        total: total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    next(err);
  }
};

/* GET /api/orders/manage/summary - counts for the sidebar badge */
export const manageSummaryHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const [row] = await db
      .select({
        unfulfilled: sql<number>`count(*) filter (where ${orders.fulfillmentStatus} = 'unfulfilled')::int`,
        processing: sql<number>`count(*) filter (where ${orders.fulfillmentStatus} = 'processing')::int`,
      })
      .from(orders)
      .where(eq(orders.status, "paid"));
    res.json({
      unfulfilled: row?.unfulfilled ?? 0,
      processing: row?.processing ?? 0,
    });
  } catch (err) {
    next(err);
  }
};
