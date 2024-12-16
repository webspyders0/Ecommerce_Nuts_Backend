import slugify from "slugify";
import Product from "../models/productModel.js"; // Adjust the import path based on your project structure
import Order from "../models/orderModel.js";
export const createProduct = async (req, res) => {
  try {
    const {
      productName,
      productDescription,
      productBrand,
      productCategory,
      Productprice,
      stock,
      imageUrl,
      tags,
      weight,
    } = req.body;

    // Ensure slug is generated properly
    const slug = slugify(productName || "", { lower: true, strict: true });
    if (!slug) throw new Error("Slug generation failed");

    // Generate unique inventory identifier
    const inventory = `INV-${Date.now()}-${Math.random().toString(36)}`;

    const product = await Product.create({
      productName,
      productDescription,
      productBrand,
      productCategory,
      Productprice,
      stock,
      imageUrl,
      tags,
      slug,
      weight,
      inventory,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const { search } = req.query; // Extract the search query parameter
    let query = {};

    // Build the query if a search term is provided
    if (search) {
      query = {
        $or: [
          { productName: { $regex: search, $options: "i" } }, // Match product name (case-insensitive)
          { productCategory: { $regex: search, $options: "i" } }, // Match product category
          { tags: { $regex: search, $options: "i" } }, // Match tags
        ],
      };
    }

    // Log the query for debugging
    console.log("Search Query:", query);

    // Fetch products based on the query and populate reviews with user email
    const products = await Product.find(query).populate(
      "reviews.user",
      "email"
    );

    // Return all products if no search term or the filtered ones
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    // Log and return the error response
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(
      id,
      { $inc: { visitedCount: 1 } }, // Increment visited count
      { new: true }
    ).populate("reviews.user", "name email");

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Handle slug update if product name changes
    if (updatedData.productName) {
      updatedData.slug = slugify(updatedData.productName, { lower: true });
    }

    const product = await Product.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addReview = async (req, res) => {
  try {
    const { id } = req.params; // Product ID from URL
    const { comment, rating } = req.body; // Review details
    const userId = req.user.userId; // Authenticated user's ID

    // Step 1: Check if the user has purchased this product
    const hasPurchased = await Order.exists({
      userId: userId,
      "products.productId": id, // Match productId inside the products array
      orderStatus: "Delivered", // Ensure the order is delivered
    });

    if (!hasPurchased) {
      return res.status(403).json({
        success: false,
        message:
          "You can only review products you have purchased and received.",
      });
    }

    // Step 2: Find the product
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Step 3: Check if the user already reviewed this product
    const existingReview = product.reviews.find(
      (review) => review.user.toString() === userId
    );

    if (existingReview) {
      // Update existing review
      existingReview.comment = comment;
      existingReview.rating = parseFloat(rating);
    } else {
      // Add a new review
      product.reviews.push({
        user: userId,
        comment,
        rating: parseFloat(rating),
      });
    }

    // Step 4: Recalculate average product ratings
    const totalRatings = product.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const avgRating =
      product.reviews.length > 0 ? totalRatings / product.reviews.length : 0;

    product.productRatings = avgRating;

    // Step 5: Save the product with the updated review
    await product.save();

    res.status(200).json({
      success: true,
      data: {
        productRatings: product.productRatings,
        reviews: product.reviews,
      },
    });
  } catch (error) {
    console.error("Error adding review:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Filter products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.query;
    const products = await Product.find({ prodctCategory: category });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Filter products by tags
export const getProductsByTags = async (req, res) => {
  try {
    console.log(req.query);

    const { tags } = req.query;

    // Ensure the query handles `tags` as an array or a single string
    const filter = Array.isArray(tags) ? { tags: { $in: tags } } : { tags };

    const products = await Product.find(filter);

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update stock
export const updateStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;

    const product = await Product.findByIdAndUpdate(
      id,
      { stock },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTopVisitedProducts = async (req, res) => {
  try {
    const topProducts = await Product.find()
      .sort({ visitedCount: -1 }) // Sort by visited count in descending order
      .limit(5); // Limit to 5 products

    res.status(200).json({ success: true, data: topProducts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
