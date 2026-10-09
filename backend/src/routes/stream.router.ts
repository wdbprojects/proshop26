import { Router } from "express";
import { createStreamToken } from "../controllers/stream.controllers";
import { requireAuth } from "../middlewares/authorization";

const router = Router();
router.use(requireAuth);

router.post("/token", createStreamToken);

export default router;
