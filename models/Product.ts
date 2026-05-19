// models/Product.ts — Product schema with Cloudinary image fields

import mongoose, { Schema, Document, models } from "mongoose";

export interface IProductDoc extends Document {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  cloudinaryId: string;
  category: mongoose.Types.ObjectId;
}

const ProductSchema = new Schema<IProductDoc>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    cloudinaryId: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
  },
  { timestamps: true },
);

export default models.Product ||
  mongoose.model<IProductDoc>("Product", ProductSchema);


  