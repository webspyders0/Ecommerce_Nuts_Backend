import express from "express";
import {
  toggleWishlist,
  getWishlistProducts,
} from "../controllers/wishlistController.js";
import { authenticateUser } from "../middlewares/authenticateMiddleware.js";

const router = express.Router();

// Toggle wishlist (add/remove product)
router.post("/toggle", authenticateUser, toggleWishlist);

// Get all products in the wishlist
router.get("/", authenticateUser, getWishlistProducts);

export default router;
