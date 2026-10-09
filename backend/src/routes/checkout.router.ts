import { Router } from "express";
import { createCheckout } from "../controllers/checkout.controllers";
import { resolveCart } from "../middlewares/resolve-cart";
import { requireAuth } from "../middlewares/authorization";

const router = Router();

/* requireAuth runs first and populates req.session - checkout requires a logged-in customer (unlike cart.router.ts, which allows guests), and resolveCart is written to reuse req.session when it's already set, rather than re-validating the same session a second time.  */
router.use(requireAuth);
router.use(resolveCart);

router.post("/", createCheckout);

export default router;
