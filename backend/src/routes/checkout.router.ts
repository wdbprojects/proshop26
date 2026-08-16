import { Router } from "express";
import { createCheckout } from "../controllers/checkout.controllers";

const router = Router();

router.post("/", createCheckout);

export default router;
