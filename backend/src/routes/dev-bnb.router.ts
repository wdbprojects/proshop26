import { Router } from "express";
import { fakeBnbMarkPaid } from "../lib/bnb";

const router = Router();

// Simulates the customer paying the QR in their banking app
router.post("/bnb/pay/:qrId", (req, res) => {
  const ok = fakeBnbMarkPaid(req.params.qrId as string);
  res.status(ok ? 200 : 400).json({ ok: ok });
});

export default router;
