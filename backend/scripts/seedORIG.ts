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
        brand: prod.brand,
        description: prod.description,
        longDescription: prod.longDescription,
        stock: prod.stock,
        priceCents: Number((prod.priceCents * 100).toFixed(0)),
        currency: "usd",
        rating: String(prod.rating),
        numReviews: prod.numReviews,
        isFeatured: prod.isFeatured,
        active: true,
      })
      .onConflictDoUpdate({
        target: products.slug,
        set: {
          name: prod.name,
          slug: prod.slug,
          category: prod.category,
          brand: prod.brand,
          description: prod.description,
          longDescription: prod.longDescription,
          stock: prod.stock,
          priceCents: Number((prod.priceCents * 100).toFixed(0)),
          currency: "usd",
          rating: String(prod.rating),
          numReviews: prod.numReviews,
          isFeatured: prod.isFeatured,
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
