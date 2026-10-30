import { Router } from "express";

import {
  forgotPasswordController,
  getSessionController,
  googleSignInController,
  logoutController,
  resendVerificationController,
  resetPasswordController,
  signInController,
  signUpController,
  verifyEmailController,
} from "../controllers/auth.controllers";

const router = Router();

/* BETTER AUTH SIGN UP */
router.post("/sign-up/email", signUpController);

/* BETTER AUTH SIGN IN */
router.post("/sign-in/email", signInController);

/* BETTER AUTH SIGN OUT */
router.post("/sign-out", logoutController);

/* GET SESSION */
router.get("/get-session", getSessionController);

/* BETTER AUTH EMAIL ROUTES */
router.post("/verify-email", verifyEmailController);
router.post("/resend-verification", resendVerificationController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);

/* GOOGLE OAUTH */
router.post("/google", googleSignInController);

export default router;
