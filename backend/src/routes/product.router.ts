import { Router } from "express";
import {
  getAllProducts,
  getCategories,
  getProductBySlug,
} from "../controllers/product.controllers";

const router = Router();

router.get("/", getAllProducts);
router.get("/categories", getCategories);
router.get("/:slug", getProductBySlug);

export default router;
