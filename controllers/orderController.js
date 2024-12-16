import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

export const createOrder = async (req, res) => {
  try {
    const { products, orderStatus, shippingAddress, paymentStatus } = req.body;

    const productDetails = [];
    let totalAmount = 0;

    // Sequentially fetch product details and calculate total amount
    for (const item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      const productPrice = product.Productprice; // Assuming the product model has a `Productprice` field
      const quantity = item.quantity;

      // Calculate subtotal for this product and add to total amount
      totalAmount += productPrice * quantity;

      // Add product details to the array
      productDetails.push({
        productId: item.productId,
        quantity,
        price: productPrice,
      });
    }

    // Create the order
    const newOrder = await Order.create({
      userId: req.user.userId, // Assuming user ID is available via authentication middleware
      products: productDetails,
      totalAmount,
      orderStatus,
      shippingAddress,
      paymentStatus,
    });

    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId).populate("products.productId");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order", error });
  }
};
export const getOrdersByUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const orders = await Order.find({ userId }).populate("products.productId");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders", error });
  }
};
export const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { orderStatus } = req.body;

  try {
    // Find the order by ID
    const order = await Order.findById(orderId).populate("products.productId");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    console.log("oreder : ", order);

    // If the status is Delivered or Cancelled, update user order history
    if (["Delivered", "Cancelled"].includes(orderStatus)) {
      // Update the order status in the Order model
      order.orderStatus = orderStatus;
      await order.save();

      // Find the user associated with the order
      const user = await userModel.findById(order.userId);
      if (!user) {
        return res.status(404).json({
          message: "User associated with this order not found",
        });
      }
      console.log(user, "user /");

      // Prepare the order history entry
      const orderHistoryEntry = {
        orderId: order._id,
        items: order.products.map((product) => ({
          productId: product.productId._id,
          quantity: product.quantity,
        })),
        totalAmount: order.totalAmount,
        status: orderStatus.toLowerCase(),
        date: new Date(),
      };
      console.log("order histroy : ", orderHistoryEntry);

      // Add the order history entry to the user's order history
      user.orderHistory.push(orderHistoryEntry);
      await user.save();

      return res.status(200).json({
        message: `Order status updated to ${orderStatus}, and history added to user model`,
        order,
        userOrderHistory: user.orderHistory,
      });
    }

    // For other statuses, simply update the Order model
    order.orderStatus = orderStatus;
    await order.save();

    return res.status(200).json({
      message: `Order status updated to ${orderStatus}`,
      order,
    });
  } catch (error) {
    console.error("Error updating order status:", error.message);
    res.status(500).json({ message: "Failed to update order status", error });
  }
};

export const deleteOrder = async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findByIdAndDelete(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete order", error });
  }
};
