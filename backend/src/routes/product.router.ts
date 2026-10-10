import { Router } from "express";
import {
  getAllProducts,
  getCategories,
  getProductBySlug,
  suggestProducts,
} from "../controllers/product.controllers";

const router = Router();

router.get("/", getAllProducts);
router.get("/categories", getCategories);
/* Must come before /:slug - otherwise Express matches "suggest" as a slang value and this route is never reached */
router.get("/suggest", suggestProducts);
router.get("/:slug", getProductBySlug);

export default router;
