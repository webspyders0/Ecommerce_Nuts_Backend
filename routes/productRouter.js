import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsByTags,
  addReview,
  updateStock,
  getTopVisitedProducts,
} from "../controllers/productController.js";
import { authenticateUser } from "../middlewares/authenticateMiddleware.js";

const router = Router();

// Filters
router.get("/category/:category", getProductsByCategory); // Get products by category
router.get("/tags", getProductsByTags); // Get products by tags using a query parameter

//frequently
router.get("/top-visited", getTopVisitedProducts);

// Product routes
router.post("/", authenticateUser, createProduct); // Create a new product
router.get("/", getAllProducts); // Get all products
router.get("/:id", getProductById); // Get a product by ID
router.patch("/:id", authenticateUser, updateProduct); // Update product by ID
router.delete("/:id", authenticateUser, deleteProduct); // Delete product by ID

// Reviews
router.patch("/reviews/:id", authenticateUser, addReview); // Add a review to a product

// Stock update
router.patch("/stock/:id", authenticateUser, updateStock); // Update product stock

export default router;
