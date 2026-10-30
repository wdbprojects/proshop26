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
  forgotPassword: "/auth/forgot-password",
  resetPassword: "/auth/reset-password",
  verifyEmail: "/auth/verify-email",
  /* ECOMMERCE */
  catalog: "/catalog",
  products: "/products",
  productDetails: (slug: string) => {
    return `/products/${slug}`;
  },
  cart: "/cart",
  orders: "/orders",
  orderItem: (id: string) => {
    return `/orders/${id}`;
  },
  checkout: "/checkout",
};
