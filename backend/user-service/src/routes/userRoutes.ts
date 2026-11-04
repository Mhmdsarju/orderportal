import { Router } from "express";
import { me, byId } from "../controllers/userController";
import { authenticate, adminOnly } from "../middleware/auth";
const router = Router();
router.get("/me", authenticate, me);
router.get("/:id", authenticate, adminOnly, byId);
export default router;
