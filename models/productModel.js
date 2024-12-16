import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, unique: true, trim: true },
    productDescription: { type: String, required: true },
    productBrand: { type: [String], required: true },
    productCategory: { type: [String], required: true },
    Productprice: { type: Number, required: true },
    stock: { type: Number, required: true, default: 0 },
    imageUrl: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length <= 4;
        },
        message: "You can upload a maximum of 4 images",
      },
      required: true,
    },
    tags: { type: [String] }, // Keywords for SEO
    productRatings: { type: Number, default: 0 },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        comment: { type: String },
        rating: { type: Number },
        date: { type: Date, default: Date.now },
      },
    ],
    slug: { type: String, required: true },
    visitedCount: { type: Number, default: 0 },
    status: { type: String, default: "in stock" },
    weight: { type: String },
    inventory: { type: String, unique: true },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
