import { Router } from "express";
import { authenticate } from "../middleware/auth";
import {
  createOrder,
  listOrders,
  getOrder,
  updateOrder,
} from "../controllers/orderController";
const router = Router();
router.use(authenticate);
router.post("/", createOrder);
router.get("/", listOrders);
router.get("/:id", getOrder);
router.patch("/:id", updateOrder);
export default router;
