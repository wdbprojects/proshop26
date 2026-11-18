import { getEnv } from "../src/config/env";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "../src/drizzle/schema";
import { CATALOG, CATEGORIES } from "./sample-data";
import { categories, products } from "../src/drizzle/schema";
import { eq } from "drizzle-orm";

const ENV = getEnv();
export const db = drizzle(ENV.DATABASE_URL, { schema: schema });

const main = async () => {
  /* 1. Categories first: products.categoryId is a required FK, so every category a product references must already exist before any product insert runs  */
  const categoryIdBySlug = new Map<string, string>();
  for (const cat of CATEGORIES) {
    const [row] = await db
      .insert(categories)
      .values({ name: cat.name, slug: cat.slug })
      .onConflictDoUpdate({
        target: categories.slug,
        set: { name: cat.name },
      })
      .returning({ id: categories.id, slug: categories.slug });
    categoryIdBySlug.set(row.slug, row.id);
  }
  /* 2. Products */
  for (const prod of CATALOG.products) {
    const categoryId = categoryIdBySlug.get(prod.categorySlug);
    if (!categoryId) {
      throw new Error(
        `Sample product "${prod.slug}" references unknown category slug ` +
          `"${prod.categorySlug}" - add it to CATEGORIES in sample-data.ts`,
      );
    }
    const [insertedProduct] = await db
      .insert(products)
      .values({
        name: prod.name,
        slug: prod.slug,
        categoryId: categoryId,
        brand: prod.brand,
        description: prod.description,
        longDescription: prod.longDescription,
        stock: prod.stock,
        priceCents: prod.priceCents,
        currency: "bob",
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
          categoryId: categoryId,
          brand: prod.brand,
          description: prod.description,
          longDescription: prod.longDescription,
          stock: prod.stock,
          priceCents: prod.priceCents,
          currency: "bob",
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
    `Seed complete: ${CATEGORIES.length} categories, ${CATALOG.products.length} products upserted with images. 🍀`,
  );
  const client = db.$client;
  await client.end();
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
