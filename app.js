// Importing all necessary packages
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(morgan("dev"));

// to import the routes
import authRouter from "./routes/authRoute.js";
import resetRouter from "./routes/resetPasswordRoute.js";
import { sendEmail } from "./controllers/emailController.js";
import productRouter from "./routes/productRouter.js";
import orderRouter from "./routes/orderRouter.js";
import userRouter from "./routes/userRouter.js";
import adminRouter from "./routes/adminRouter.js";
import wishRouter from "./routes/whishRouter.js";
import cartRouter from "./routes/cartRouter.js";


app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/redirect", resetRouter);
app.use("/api/v1/send-email", sendEmail);
app.use("/api/v1/product", productRouter);
app.use("/api/v1/wishlist", wishRouter);
app.use("/api/v1/order", orderRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/cart", cartRouter);
// Routes

app.get("/", (req, res) => {
  res.send("hello world");
});

// Error handling routes
app.use("*", (req, res) => {
  res.status(404).json({ msg: "not found" });
});

// Listen on port and connect to MongoDB
const port = process.env.PORT || 3333;
try {
  await mongoose.connect(process.env.MONGO_URL);
  app.listen(port, () => {
    console.log(`server running on PORT ${port}....`);
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}
