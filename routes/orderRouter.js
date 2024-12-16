import { Router } from "express";
import {
  createOrder,
  getOrderById,
  getOrdersByUser,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";
import { authenticateUser } from "../middlewares/authenticateMiddleware.js";

const router = Router();

// Create a new order
router.post("/", authenticateUser, createOrder);

// Get an order by its ID
router.get("/:orderId", authenticateUser, getOrderById);

// Get all orders for a specific user
router.get("/user/:userId", authenticateUser, getOrdersByUser);

// Update the status of an order
router.patch("/status/:orderId", authenticateUser, updateOrderStatus);

// Delete an order
router.delete("/:orderId", authenticateUser, deleteOrder);

export default router;
