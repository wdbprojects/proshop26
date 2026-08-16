import { getEnv } from "../src/config/env";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/drizzle/schema";
import { products } from "../src/drizzle/schema";
import { CATALOG } from "./sample-data";
const ENV = getEnv();
export const db = drizzle(ENV.DATABASE_URL, { schema: schema });

const main = async () => {
  const rows = CATALOG.products.map((prod) => {
    return {
      name: prod.name,
      slug: prod.slug,
      category: prod.category,
      description: prod.description,
      images: prod.images,
      imageUrl: prod.images[0],
      price: String(prod.price),
      // priceCents: Number((prod.price * 100).toFixed(0)),
      priceCents: 9900,
      brand: prod.brand,
      rating: String(prod.rating),
      numReviews: prod.numReviews,
      stock: prod.stock,
      isFeatures: prod.isFeatured,
      banner: prod.banner,
      currency: "usd",
      active: true,
    };
  });
  for (const row of rows) {
    await db
      .insert(schema.products)
      .values(row)
      .onConflictDoUpdate({
        target: products.slug,
        set: {
          name: row.name,
          category: row.category,
          description: row.description,
          priceCents: row.priceCents,
          currency: row.currency,
          imageUrl: row.imageUrl,
          active: row.active,
        },
      });
  }
  console.log(
    `Seed complete (${CATALOG.products.length}) products upserted. 🍀`,
  );
  const client = db.$client;
  await client.end();
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
