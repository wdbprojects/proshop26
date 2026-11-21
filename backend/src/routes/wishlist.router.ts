import { Router } from "express";
import { requireAuth } from "../middlewares/authorization";
import {
  addWishlistHandler,
  listWishlistHandler,
  listWishlistIdsHandler,
  removeWishlistHandler,
} from "../controllers/wishlist.controllers";

const router = Router();
router.use(requireAuth);

router.get("/", listWishlistHandler);
router.get("/ids", listWishlistIdsHandler);
router.put("/:productId", addWishlistHandler);
router.delete("/:productId", removeWishlistHandler);

export default router;
