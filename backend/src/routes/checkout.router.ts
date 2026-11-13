import { Router } from "express";
import { requireAuth } from "../middlewares/authorization";
import { resolveCart } from "../middlewares/resolve-cart";
import {
  createCheckout,
  createQrCheckout,
  getQrCheckoutStatus,
} from "../controllers/checkout.controllers";

const router = Router();

// requireAuth runs first and populates req.session; resolveCart reuses it
router.use(requireAuth);
router.use(resolveCart);

router.post("/", createCheckout);
router.post("/qr", createQrCheckout);
router.get("/qr/:qrId", getQrCheckoutStatus);

export default router;
