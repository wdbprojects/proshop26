import { NextFunction, Request, Response } from "express";
import { getEnv } from "../config/env";
import { getCurrentSession } from "../lib/session";
import {
  // order as ordersTable,
  orders,
  orderItems,
  products,
  user,
  UserRole,
} from "../drizzle/schema";
import { isStaff } from "../lib/roles";
import { db } from "../drizzle/db";
import { asc, desc, eq, inArray } from "drizzle-orm";
import {
  getStreamChatServer,
  streamChatDisplayName,
  streamUserId,
} from "../lib/stream";
import { ExtendedChannelData } from "../config/type-schemas";

const ENV = getEnv();

/* GET ALL ORDERS */
export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await getCurrentSession(req.headers);
    if (!session) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const user = session?.user;

    const rows = isStaff(user?.role as UserRole)
      ? await db.select().from(orders).orderBy(desc(orders.createdAt))
      : await db.select().from(orders).where(eq(orders.userId, user.id));

    const orderIds = rows.map((order) => {
      return order.id;
    });

    // create the order map
    const previewByOrder = new Map();

    // generate inner join to get orders & product details
    if (orderIds.length > 0) {
      const itemRows = await db
        .select({
          orderId: orderItems.orderId,
          quantity: orderItems.quantity,
          name: products.name,
          slug: products.slug,
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
export const getSingleOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await getCurrentSession(req.headers);
    if (!session) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const user = session?.user;
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
    const items = await db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        unitPriceCents: orderItems.unitPriceCents,
        product: products,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, singleOrder.id));
    res.status(200).json({ singleOrder: singleOrder, items: items });
  } catch (error) {
    next(error);
  }
};

/* CREATE STREAM CHANNEL */
export const createStreamChannel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await getCurrentSession(req.headers);
    if (!session) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const user = session?.user;
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
      channelId,
      streamUserId: streamChatUserId,
    });
  } catch (error) {
    next(error);
  }
};

/* VIDEO INVITE */
export const createVideoInvite = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const session = await getCurrentSession(req.headers);
    if (!session) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const userData = session?.user;
    const server = getStreamChatServer(ENV);

    if (!isStaff(userData?.role as UserRole)) {
      res
        .status(403)
        .json({ error: "Only support or admin can send a video invite" });
      return;
    }
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
