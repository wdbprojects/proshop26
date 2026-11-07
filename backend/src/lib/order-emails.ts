import { eq } from "drizzle-orm";
import { getEnv } from "../config/env";
import { db } from "../drizzle/db";
import { orderItems, orders, products, user } from "../drizzle/schema";
import {
  orderConfirmedTemplate,
  orderShippedTemplate,
} from "./email-templates";
import { sendEmail } from "./email";

const ENV = getEnv();

const orderUrl = (orderId: string) => {
  return `${ENV.FRONTEND_URL.replace(/\/+$/, "")}/dasboard/orders/${orderId}`;
};

const loadOrder = async (orderId: string) => {
  const [row] = await db
    .select({ order: orders, name: user.name, email: user.email })
    .from(orders)
    .innerJoin(user, eq(orders.userId, user.id))
    .where(eq(orders.id, orderId))
    .limit(1);
  return row;
};

export const sendOrderConfirmedEmai = async (orderId: string) => {
  try {
    const row = await loadOrder(orderId);
    if (!row) return;
    const items = await db
      .select({
        name: products.name,
        quantity: orderItems.quantity,
        unitPriceCents: orderItems.unitPriceCents,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));
    await sendEmail({
      to: row.email,
      ...orderConfirmedTemplate({
        name: row.name,
        orderId: orderId,
        items: items,
        totalCents: row.order.totalCents,
        currency: row.order.currency,
        url: orderUrl(orderId),
      }),
    });
  } catch (err) {
    console.error("Order confirmation email failed", err);
  }
};

export const sendOrderShippedEmail = async (orderId: string) => {
  try {
    const row = await loadOrder(orderId);
    if (!row) return;
    await sendEmail({
      to: row.email,
      ...orderShippedTemplate({
        name: row.name,
        orderId: orderId,
        trackingNumber: row.order.trackingNumber,
        url: orderUrl(orderId),
      }),
    });
  } catch (err) {
    console.error("Order shipped email failed, err");
  }
};
