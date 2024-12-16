import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    adminName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    whatsappNumber: {
      type: String,
    },
    adminAddress: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "admin", // Default role is "admin"
    },
    avatar: {
      type: String, // URL for admin avatar
    },
    siteTitle: {
      type: String,
      required: true,
    },
    currencyType: {
      type: String,
      enum: ["USD", "IND", "EURO"], // Restrict to specific currencies
      required: true,
    },
    taxRate: {
      type: Number,
      required: true, // Tax rate as a percentage
    },
    shippingThreshold: {
      type: Number,
      required: true, // Threshold for free shipping
    },
    password: {
      type: String,
      required: true, // Make sure to hash passwords before saving
    },
    mode: {
      type: String,
      enum: ["allowUserLogin", "underMaintenance"], // Operational mode
      default: "allowUserLogin",
    },
    visitedCount: {
      type: Number,
      default: 0,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    permissions: {
      type: [String],
      default: ["manageSite"],
    },

    locations: {
      type: [String], // Array of locations
      default: [],
    },
    discountApplicableAmount: {
      type: Number, // Threshold amount for discount eligibility
      default: 2000,
    },
    discountInRupees: {
      type: Number, // Discount in rupees
      default: 100,
    },
    discountCoupon: {
      type: String, // Discount coupon code
      default: "DRY50",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);
