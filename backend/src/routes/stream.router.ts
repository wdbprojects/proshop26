import { Router } from "express";
import { createStreamToken } from "../controllers/stream.controllers";

const router = Router();

router.post("/token", createStreamToken);

export default router;
