import { Router } from "express";
import { requireAuth } from "../middlewares/authorization";
import { upsertReviewHandler } from "../controllers/review.controlers";

const router = Router();
router.use(requireAuth);

router.put("/:productId", upsertReviewHandler);

export default router;
