import { Router } from "express";

import {
  getSessionController,
  logoutController,
  signInController,
  signUpController,
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

export default router;
