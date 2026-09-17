import { Router } from "express";
import { resolveCart } from "../middlewares/resolve-cart";
import {
  addCartItemsHandler,
  deleteCartItemsHandler,
  getCartHandler,
  updateCartItemsHandler,
} from "../controllers/cart.controllers";

const router = Router();

// every cart needs to know "whose cart is this" first
router.use(resolveCart);

router.get("/", getCartHandler);
router.post("/items", addCartItemsHandler);
router.patch("/items/:cartItemId", updateCartItemsHandler);
router.delete("/items/:cartItemId", deleteCartItemsHandler);

export default router;
