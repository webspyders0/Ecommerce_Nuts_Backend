import User from "../models/userModel.js";
import Product from "../models/productModel.js";

// Toggle Wishlist
export const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body; // Product to toggle in the wishlist

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if the product is already in the wishlist
    const wishlistItemIndex = user.wishlist.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (wishlistItemIndex !== -1) {
      // Remove the product from the wishlist
      user.wishlist.splice(wishlistItemIndex, 1);
    } else {
      // Add the product to the wishlist
      user.wishlist.push({ productId });
    }

    await user.save();

    res.status(200).json({
      success: true,
      message:
        wishlistItemIndex !== -1
          ? "Product removed from wishlist"
          : "Product added to wishlist",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Wishlist Products
export const getWishlistProducts = async (req, res) => {
  try {
    const userId = req.user.id; // Assume `req.user` contains the authenticated user's info

    const user = await User.findById(userId).populate({
      path: "wishlist.productId",
      model: "Product",
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const wishlistProducts = user.wishlist.map((item) => item.productId);

    res.status(200).json({
      success: true,
      data: wishlistProducts,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
