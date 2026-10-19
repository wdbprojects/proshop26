import { ReactNode } from "react";
import { IProducts } from "./type-schemas";

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
