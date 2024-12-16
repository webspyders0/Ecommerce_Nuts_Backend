import { Router } from "express";
import {
  deliverLatestOrder,
  getAllUsers,
} from "../controllers/userController.js";
import { authenticateUser } from "../middlewares/authenticateMiddleware.js";

const router = Router();

router.post("/delivery", authenticateUser, deliverLatestOrder);
router.get("/allusers", getAllUsers);

export default router;
