export const routes = {
  home: "/",
  about: "/about",
  /* DASHBOARD */
  dashboard: "/dashboard",
  admin: "/dashboard/admin",
  createProduct: "/dashboard/admin/create-product",
  editProduct: (id: string) => {
    return `/dashboard/admin/edit-product/${id}`;
  },

  /* AUTH */
  login: "/auth/login",
  register: "/auth/register",
  /* ECOMMERCE */
  catalog: "/products/catalog",
  products: "/products",
  productDetails: (slug: string) => {
    return `/products/${slug}`;
  },
  cart: "/cart",
  orders: "/orders",
  orderItem: (id: string) => {
    return `/orders/${id}`;
  },
};
