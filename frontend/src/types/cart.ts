/* ZUSTAND = client-side optimistic cache only, NOT the source of truth. The server (cart + cart_items tables) is authoritative. Deliberately minimal: no name/price/image here, since those live on `products` and would go stale if duplicated into this store */

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  setQuantity: (productId: string, quantity: number) => void;
  // overwrites local state with the server's response - call this after any successful mutation so Zustand never drifts from the DB
  replaceItems: (items: CartItem[]) => void;
}

/* API response shapes - what GET /api/cart, and every mutation endpoint, actually returns. This is what the cart PAGE renders directly- it's already hydrated with everything the UI needs, no client-side join against a separate product list required */
export interface ICartItemHydrated {
  id: string;
  productId: string;
  name: string;
  slug: string;
  quantity: number;
  priceCents: number; // current product price
  priceCentsAtAdd: number; // snapshot - used to flag "price changed"
  currency: string;
  stock: number;
  image: string | null;
}

export interface ICart {
  id: string;
  itemsPriceCents: number;
  totalPriceCents: number;
  shippingPriceCents: number;
  taxPriceCents: number;
  items: ICartItemHydrated[];
}
