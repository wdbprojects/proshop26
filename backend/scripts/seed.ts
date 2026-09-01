import { getEnv } from "../src/config/env";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/drizzle/schema";
import { products } from "../src/drizzle/schema";
import { CATALOG } from "./sample-data";
import { eq } from "drizzle-orm";

const ENV = getEnv();
export const db = drizzle(ENV.DATABASE_URL, { schema: schema });

const main = async () => {
  for (const prod of CATALOG.products) {
    const [insertedProduct] = await db
      .insert(products)
      .values({
        name: prod.name,
        slug: prod.slug,
        category: prod.category,
        description: prod.description,
        longDescription: prod.longDescription,
        price: String(prod.price),
        priceCents: Number((prod.price * 100).toFixed(0)),
        brand: prod.brand,
        rating: String(prod.rating),
        numReviews: prod.numReviews,
        stock: prod.stock,
        isFeatured: prod.isFeatured,
        currency: "usd",
        active: true,
      })
      .onConflictDoUpdate({
        target: products.slug,
        set: {
          name: prod.name,
          category: prod.category,
          description: prod.description,
          longDescription: prod.longDescription,
          priceCents: Number((prod.price * 100).toFixed(0)),
          price: String(prod.price),
          brand: prod.brand,
          rating: String(prod.rating),
          numReviews: prod.numReviews,
          stock: prod.stock,
          isFeatured: prod.isFeatured,
          currency: "usd",
          active: true,
        },
      })
      .returning({ id: products.id });
    // clear existing images for this product so re-seeding doesn't duplicate rows
    await db
      .delete(schema.productImages)
      .where(eq(schema.productImages.productId, insertedProduct.id));

    const imageRows = prod.images.map((url, index) => {
      return {
        productId: insertedProduct.id,
        url: url,
        order: index,
        isPrimary: index === 0,
      };
    });
    if (imageRows.length > 0) {
      await db.insert(schema.productImages).values(imageRows);
    }
  }
  console.log(
    `Seed complete (${CATALOG.products.length}) products upserted with images. 🍀`,
  );
  const client = db.$client;
  await client.end();
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
