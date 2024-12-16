import express from "express";
import {
  addItemToCart,
  getCart,
  updateItemQuantity,
  removeItemFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { authenticateUser } from "../middlewares/authenticateMiddleware.js";

const router = express.Router();

// Add item to cart
router.post("/add", authenticateUser, addItemToCart);

// Get user cart
router.get("/:userId", authenticateUser, getCart);

// Update item quantity
router.patch("/update", authenticateUser, updateItemQuantity);

// Remove item from cart
router.delete("/remove", authenticateUser, removeItemFromCart);

// Clear the cart
router.delete("/clear", authenticateUser, clearCart);

export default router;
