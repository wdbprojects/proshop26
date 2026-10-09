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

export default router;
