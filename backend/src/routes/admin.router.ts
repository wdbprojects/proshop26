import { Router } from "express";
import {
  // createAdminProduct,
  // deleteAdminProduct,
  // deleteProductImage,
  deleteProductImageUpload,
  getImageKitAuth,
  getProductById,
  listAdminProducts,
  updateAdminProduct,
} from "../controllers/admin.controllers";

const router = Router();

router.get("/imagekit/auth", getImageKitAuth);
router.get("/products", listAdminProducts);
// router.post("/products", createAdminProduct);
// router.patch("/products/:id", updateAdminProduct);
// router.put("/products/:id", updateAdminProduct);
// router.delete("/products/:id", deleteAdminProduct);
// router.delete("/products/:id/image", deleteProductImage);
router.delete("/products/:id/imageUpload", deleteProductImageUpload);
router.get("/products/:id", getProductById);

export default router;
