import { count, desc, eq, asc, and } from "drizzle-orm";
import { db } from "../drizzle/db";
import { addresses, user } from "../drizzle/schema";
import {
  addressIdParamsSchema,
  AddressInput,
  addressInputSchema,
} from "../validators/address.validators";
import { NextFunction, Request, Response } from "express";
import { ApiError } from "../lib/api-error";

const MAX_ADDRESSES = 4;

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

// every write locks the user's row first, so two requests from the same user run one after the other. That keeps the limit and the single-default rule safe.
const lockUser = async (tx: Tx, userId: string) => {
  await tx
    .select({ id: user.id })
    .from(user)
    .where(eq(user.id, userId))
    .for("update");
};

const toValues = (input: AddressInput) => {
  return {
    label: input.label || null,
    fullName: input.fullName,
    phone: input.phone,
    city: input.city,
    zone: input.zone || null,
    street: input.street || null,
    reference: input.reference || null,
    latitude: input.latitude,
    longitude: input.longitude,
  };
};

// GET /api/addresses - default first, then oldest first
export const listAddressesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.session!.user.id;
    const rows = await db
      .select()
      .from(addresses)
      .where(eq(addresses.userId, userId))
      .orderBy(desc(addresses.isDefault), asc(addresses.createdAt));
    res.json({ addresses: rows, maxAddresses: MAX_ADDRESSES });
  } catch (err) {
    next(err);
  }
};

// POST /api/addresses
export const createAddressHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.session!.user.id;
    const input = addressInputSchema.parse(req.body);
    const created = await db.transaction(async (tx) => {
      await lockUser(tx, userId);
      const [{ total }] = await tx
        .select({ total: count() })
        .from(addresses)
        .where(eq(addresses.userId, userId));
      if (Number(total) >= MAX_ADDRESSES) {
        throw new ApiError(
          409,
          `You can save up to ${MAX_ADDRESSES} addresses. Delete on to add another.`,
        );
      }
      // the first address is always the default
      const makeDefault = input.isDefault || Number(total) === 0;
      if (makeDefault) {
        await tx
          .update(addresses)
          .set({ isDefault: false })
          .where(eq(addresses.userId, userId));
      }
      const [row] = await tx
        .insert(addresses)
        .values({ ...toValues(input), userId, isDefault: makeDefault })
        .returning();
      return row;
    });
    res.status(201).json({ address: created });
  } catch (err) {
    next(err);
  }
};

// PUT /api/addresses/:id - can promote to default, can't un-default (pick another one instead)
export const updateAddressHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.session!.user.id;
    const { id } = addressIdParamsSchema.parse(req.params);
    const input = addressInputSchema.parse(req.body);
    const updated = await db.transaction(async (tx) => {
      await lockUser(tx, userId);
      const [existing] = await tx
        .select()
        .from(addresses)
        .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
        .limit(1);
      if (!existing) {
        throw new ApiError(404, "Address not found");
      }
      const promote = input.isDefault && !existing.isDefault;
      if (promote) {
        await tx
          .update(addresses)
          .set({ isDefault: false })
          .where(eq(addresses.userId, userId));
      }
      const [row] = await tx
        .update(addresses)
        .set({
          ...toValues(input),
          ...(promote ? { isDefault: true } : {}),
        })
        .where(eq(addresses.id, id))
        .returning();
      return row;
    });
    res.json({ address: updated });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/addressses/:id/default
export const setDefaultAddressHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.session!.user.id;
    const { id } = addressIdParamsSchema.parse(req.params);

    await db.transaction(async (tx) => {
      await lockUser(tx, userId);
      const [existing] = await tx
        .select({ id: addresses.id })
        .from(addresses)
        .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
        .limit(1);
      if (!existing) {
        throw new ApiError(404, "Address not found");
      }
      // unset first: the unique index is checked per statement
      await tx
        .update(addresses)
        .set({ isDefault: false })
        .where(eq(addresses.userId, userId));
      await tx
        .update(addresses)
        .set({ isDefault: true })
        .where(eq(addresses.id, id));
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/addressses/:id
export const deleteAddressHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.session!.user.id;
    const { id } = addressIdParamsSchema.parse(req.params);

    await db.transaction(async (tx) => {
      await lockUser(tx, userId);
      const [removed] = await tx
        .delete(addresses)
        .where(and(eq(addresses.id, id), eq(addresses.userId, userId)))
        .returning();
      if (!removed) {
        throw new ApiError(404, "Address not found");
      }
      // deleted the default: the newest remaining one takes over
      if (removed.isDefault) {
        const [next] = await tx
          .select({ id: addresses.id })
          .from(addresses)
          .where(eq(addresses.userId, userId))
          .orderBy(desc(addresses.createdAt))
          .limit(1);
        if (next) {
          await tx
            .update(addresses)
            .set({ isDefault: true })
            .where(eq(addresses.id, next.id));
        }
      }
    });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
