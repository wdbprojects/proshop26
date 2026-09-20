import { Router } from "express";
import { createCheckout } from "../controllers/checkout.controllers";
import { resolveCart } from "../middlewares/resolve-cart";

const router = Router();

/* checkout now reads the caller's persisted cart, so it needs the same identity resolution (userId / guest sessionCartId) every cart route gets */
router.use(resolveCart);

router.post("/", createCheckout);

export default router;
