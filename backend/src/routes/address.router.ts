import { Router } from "express";
import { requireAuth } from "../middlewares/authorization";
import {
  createAddressHandler,
  deleteAddressHandler,
  listAddressesHandler,
  setDefaultAddressHandler,
  updateAddressHandler,
} from "../controllers/address.controllers";

const router = Router();
router.use(requireAuth);

router.get("/", listAddressesHandler);
router.post("/", createAddressHandler);
router.put("/:id", updateAddressHandler);
router.patch("/:id/default", setDefaultAddressHandler);
router.delete("/:id", deleteAddressHandler);

export default router;
