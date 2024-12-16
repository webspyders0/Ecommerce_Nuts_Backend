import { Router } from "express";
import {
  adminLogin,
  logout,
  userLogin,
  userRegister,
} from "../controllers/authController.js";
import { authenticateUser } from "../middlewares/authenticateMiddleware.js";

const router = Router();

// Route handling for user registration and login (no authentication required)
router.post("/register", userRegister);
router.post("/login", userLogin);

// Routes requiring authentication
router.post("/login-admin", authenticateUser, adminLogin);
router.post("/logout", authenticateUser, logout);

export default router;
