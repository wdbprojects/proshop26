import { Router } from "express";
import {
  createStreamChannel,
  createVideoInvite,
  getAllOrders,
  getSingleOrder,
} from "../controllers/order.controllers";
import { requireAuth } from "../middlewares/authorization";

const router = Router();
router.use(requireAuth);

router.get("/", getAllOrders);
router.get("/:id", getSingleOrder);
router.post("/:id/stream-channel", createStreamChannel);
router.post("/:id/video-invite", createVideoInvite);

export default router;
