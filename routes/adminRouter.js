import { Router } from "express";

import { authenticateUser } from "../middlewares/authenticateMiddleware.js";
import {
  updateAdmin,
  updateMode,
  updatePassword,
} from "../controllers/adminController.js";

const router = Router();
router.patch("/changePassword/:id", updatePassword);
// Route handling for user registration and login (no authentication required)
router.patch("/settings/:id", authenticateUser, updateAdmin);
router.patch("/mode", authenticateUser, updateMode);

export default router;
