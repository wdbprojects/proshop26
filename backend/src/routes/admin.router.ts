import { Router } from "express";
import {
  createAdminProduct,
  deleteAdminProduct,
  // createAdminProduct,
  // deleteAdminProduct,
  // deleteProductImage,
  deleteProductImageUpload,
  getImageKitAuth,
  getProductById,
  listAdminProducts,
  updateAdminProduct,
} from "../controllers/admin.controllers";
import { requireAuth, requireRole } from "../middlewares/authorization";
import {
  createAdminCategory,
  deleteAdminCategory,
  listAdminCategories,
  updateAdminCategory,
} from "../controllers/admin-categories.controllers";
import {
  banUser,
  listUsers,
  setUserRole,
  unbanUser,
} from "../controllers/admin-users.controllers";

const router = Router();

/* Every route on this router is admin-only - gate once here rather than per-route, so a new route added can't accidentally ship unprotected */
router.use(requireAuth, requireRole("admin"));

router.get("/imagekit/auth", getImageKitAuth);

/* Not scoped to a product - this is for an image uploaded to ImageKit while building a product, then removed before ever being saved. Was previously /products/:id/imageUpload, which misleadingly implied :id was a product id; it's actually the ImageKit file id.  */

router.delete("/images/:fileId", deleteProductImageUpload);

router.get("/products", listAdminProducts);
router.post("/products", createAdminProduct);
router.get("/products/:id", getProductById);
router.patch("/products/:id", updateAdminProduct);
router.delete("/products/:id", deleteAdminProduct);
router.get("/categories", listAdminCategories);
router.post("/categories", createAdminCategory);
router.patch("/categories/:id", updateAdminCategory);
router.delete("/categories/:id", deleteAdminCategory);
router.get("/users", listUsers);
router.patch("/users/:id/role", setUserRole);
router.post("/users/:id/ban", banUser);
router.post("/users/:id/unban", unbanUser);

export default router;
