/* Category rows get seeded first (categories table), then each product below references one by `categorySlug`. This is a slug, not a free-text category name - it must match one of CATEGORIES exactly, and seed.ts will throw a clear error at seed time if it doesn't (rather than silently  failing the FK insert) */

export const CATEGORIES = [
  { name: "Men's Dress Shirts", slug: "mens-dress-shirts" },
  { name: "Men's Sweatshirts", slug: "mens-sweatshirts" },
  { name: "Electronics", slug: "electronics" },
  { name: "Home & Kitchen", slug: "home-kitchen" },
  { name: "Sportswear", slug: "sportswear" },
];

const pexelsUrl = (id: number) => {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto-compress&&cs=tinysrgb&w=800&h=480&fit=crop`;
};

const CATEGORY_IMAGES: Record<string, string[]> = {
  "mens-dress-shirts": [pexelsUrl(4443831), pexelsUrl(250288)],
  "mens-sweatshirts": [pexelsUrl(36700284), pexelsUrl(4192904)],
  electronics: [pexelsUrl(30845148), pexelsUrl(14263441)],
  "home-kitchen": [pexelsUrl(31737857), pexelsUrl(5824492)],
  sportswear: [pexelsUrl(29242410), pexelsUrl(4099878)],
};

export type SampleProduct = {
  name: string;
  slug: string;
  categorySlug: string;
  brand: string;
  description: string;
  longDescription: string;
  stock: number;
  priceCents: number;
  images: string[];
  rating: number;
  numReviews: number;
  isFeatured: boolean;
};

const BASE_PRODUCT: SampleProduct = {
  name: "Polo Sporting Stretch Shirt",
  slug: "polo-sporting-stretch-shirt",
  categorySlug: "mens-dress-shirts",
  brand: "Polo",
  description: "Classic Polo style with modern comfort",
  longDescription:
    "Classic Polo tailoring meets a modern stretch fabric blend for a shirt that moves with you all day. The wrinkle-resistant weave keeps its crisp look from morning meetings through evening plans, while a tailored cut through the chest and shoulders avoids the boxy fit of a standard dress shirt. Machine washable and built to hold color and shape wash after wash, this is the shirt you reach for when you need to look sharp without the ironing.",
  stock: 5,
  priceCents: 5999,
  images: CATEGORY_IMAGES["mens-dress-shirts"],
  rating: 4.5,
  numReviews: 10,
  isFeatured: true,
};

/* Generates `count` additional products cloned from BASE_PRODUCT, cycling through CATEGORIES (so category filtering/pagination has something real to chew on), with a few deliberately out-of-stock and a few genuinely isFeatured (so the home page's featured teaser exercises its real curated path, not just the "nothing featured yet" fallback).

These are placehoder test products, not real catalog data - swap in real names/descriptions/images once there's an admin CRUD to manage products properly.
*/

export const generateSampleProducts = (count: number): SampleProduct[] => {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    const category = CATEGORIES[n % CATEGORIES.length];
    return {
      ...BASE_PRODUCT,
      name: `${BASE_PRODUCT.name} (Sample ${n})`,
      slug: `${BASE_PRODUCT.slug}-sample-${n}`,
      categorySlug: category.slug,
      images: CATEGORY_IMAGES[category.slug],
      stock: n % 7 === 0 ? 0 : (n % 5) + 1,
      isFeatured: n % 6 === 0,
      priceCents: BASE_PRODUCT.priceCents + n * 150,
    };
  });
};

export const CATALOG = {
  products: [BASE_PRODUCT, ...generateSampleProducts(29)],
};
