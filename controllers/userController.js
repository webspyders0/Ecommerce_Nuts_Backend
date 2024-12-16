import userModel from "../models/userModel.js";
import Order from "../models/orderModel.js";
export const getCurrentUser = async (req, res) => {
  if (!req.user) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  try {
    const user = await userModel.findOne({ _id: req.user.userId });
    res.status(200).json({ user: user });
  } catch (error) {
    res.status(500).json({ msg: "error in current user", error });
  }
};

export const deliverLatestOrder = async (req, res) => {
  try {
    const userId = req.user.userId; // Logged-in user ID from authentication middleware
    console.log("Logged-in user ID: ", userId);

    // Find the latest order for the user
    const latestOrder = await Order.findOne({ userId })
      .sort({ createdAt: -1 })
      .populate("products.productId");

    if (!latestOrder) {
      return res
        .status(404)
        .json({ success: false, message: "No orders found for the user" });
    }

    // Check if the order is already delivered
    if (latestOrder.orderStatus === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "The latest order is already delivered",
      });
    }

    // Update order status to Delivered
    latestOrder.orderStatus = "Delivered";
    await latestOrder.save();

    // Find user by ID
    const user = await userModel.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Prepare the order history entry
    const orderHistoryEntry = {
      orderId: latestOrder._id,
      items: latestOrder.products.map((product) => ({
        productId: product.productId._id,
        quantity: product.quantity,
      })),
      totalAmount: latestOrder.totalAmount,
      status: latestOrder.orderStatus.toLowerCase(),
      date: latestOrder.updatedAt,
    };

    console.log("Order History Entry: ", orderHistoryEntry);

    // Push to order history and save user
    user.orderHistory.push(orderHistoryEntry);
    const savedUser = await user.save();

    console.log("Updated User: ", savedUser);

    res.status(200).json({
      success: true,
      message: "Order marked as delivered and added to history",
      orderHistory: savedUser.orderHistory,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({}).select("-password");
    res.status(200).json({ msg: "users ", users: users });
  } catch (error) {
    Response.status(500).json({ success: false, msg: error.message });
  }
};
