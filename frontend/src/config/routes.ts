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
  profile: "/dashboard/profile",
  orders: "/dashboard/orders",
  orderItem: (id: string) => {
    return `/dashboard/orders/${id}`;
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

  checkout: "/checkout",
};
