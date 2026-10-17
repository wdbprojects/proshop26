export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  order: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  brand: string | null;
  description: string;
  longDescription: string;
  stock: number;
  priceCents: number;
  currency: string;
  isFeatured: boolean;
  active: boolean;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  category: Category;
  images: ProductImage[];
  ratings: string;
  numReviews: number;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type ProductFacets = {
  brands: { brand: string; count: number }[];
  price: { min: number; max: number };
};

export type ProductSort =
  "relevance" | "newest" | "price_asc" | "price_desc" | "rating";

export type ProductsResponse = {
  products: Product[];
  pagination: Pagination;
  facets?: ProductFacets;
};

export type CategoriesResponse = { categories: Category[] };

export type ProductResponse = { product: Product };

export type ProductSuggestion = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  thumbnail: string | null;
  priceCents: number;
  currency: string;
};

export type SuggestionsResponse = { suggestions: ProductSuggestion[] };

export type CartItem = {
  id: string;
  productId: string;
  name: string;
  slug: string;
  quantity: number;
  priceCents: number;
  priceCentsAtAdd: number;
  currency: string;
  stock: number;
  image: string | null;
};

export type Cart = {
  id: string;
  itemsPriceCents: number;
  totalPriceCents: number;
  shippingPriceCents: number;
  taxPriceCents: number;
  items: CartItem[];
};

export type CartResponse = { cart: Cart };
