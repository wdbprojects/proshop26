import { Router } from "express";
import {
  createVideoInvite,
  createStreamChannel,
  getAllOrders,
  getSingleOrder,
  updateFulfillmentHandler,
} from "../controllers/order.controllers";
import { requireAuth, requireStaff } from "../middlewares/authorization";

const router = Router();
router.use(requireAuth);

router.get("/", getAllOrders);
router.get("/:id", getSingleOrder);
router.post("/:id/stream-channel", createStreamChannel);
router.post("/:id/video-invite", createVideoInvite);
router.patch("/:id/fulfillment", requireStaff, updateFulfillmentHandler);

export default router;
