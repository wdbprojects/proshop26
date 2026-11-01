import { Router } from "express";
import { requireAuth } from "../middlewares/authorization";
import {
  changePasswordHandler,
  getProfileHandler,
  updateProfileHandler,
} from "../controllers/profile.controllers";

const router = Router();
router.use(requireAuth);
router.get("/", getProfileHandler);
router.patch("/", updateProfileHandler);
router.post("/change-password", changePasswordHandler);

export default router;
