import { ReactNode } from "react";

export type LayoutPropsMain = {
  children: ReactNode;
};

/* ZUSTAND */
export interface CartItem {
  productId: string;
  name?: string;
  price?: number;
  quantity: number;
  image?: string;
}

export interface CartState {
  items: CartItem[];
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  setQuantity: (productId: string, quantity: number) => void;
  // getTotalPrice: () => void;
}

export interface ICategories {
  categories: string | string[] | null;
  loadingCategories: boolean;
}

export interface IProducts {
  active: boolean;
  category: string;
  createdAt: string;
  currency: string;
  description: string;
  id: string;
  imageKitFileId: string | null;
  imageUrl: string;
  name: string;
  price: number;
  priceCents: number;
  slug: string;
}

export interface IOrder {
  id: string;
  userId: string;
  polarCheckoutId: string | null;
  polarOrderId: string | null;
  previewItems: IOrderPreview[];
  status: string;
  totalCents: number;
  updatedAt: string;
  createdAt: string;
}

export interface IOrderItem {
  id: string;
  product: IProducts;
  quantity: number;
  unitPriceCents: number;
}
export interface IOrderPreview {
  imageUrl: string;
  name: string;
  quantity: number;
  slug: string;
}

export type TBody = {
  items: {
    productId: string;
    quantity: number;
  }[];
};

export interface ICheckoutRequest {
  items: {
    productId: string;
    quantity: number;
  }[];
}

export interface ICreateProduct {
  name: string;
  category: string;
  slug: string;
  description: string;
  priceCents: number;
  currency: string;
  imageUrl?: string | undefined;
  imageKitFileId?: string | undefined;
  active: boolean;
}
export interface IUpdateProduct {
  id?: string;
  name?: string;
  category?: string;
  slug?: string;
  description?: string;
  priceCents?: number;
  currency?: string;
  imageUrl?: string;
  imageKitFileId?: string;
  active?: boolean;
}

export interface ICartItem {
  productId: string;
  quantity: number;
}
export interface ICartLine {
  line: {
    productId: string;
    quantity: number;
  };
  product: IProducts | null;
}
export interface ICartItemProps {
  lines: ICartLine[];
  setQty: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  subtotal: number;
  checkout: () => void;
  checkoutLoading: boolean;
}

export interface IAdminProduct {
  active: boolean;
  category: string;
  createdAt: Date;
  currency: string;
  description: string;
  id: string;
  imageKitFileId: string | null;
  imageUrl: string;
  name: string;
  priceCents: number;
  slug: string;
}
