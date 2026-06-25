// models/HeroBanner.ts

import mongoose, { Schema, Document, models } from "mongoose";

export interface IHeroBanner extends Document {
  title: string;
  description: string;
  image: string;
  cloudinaryId?: string;
  buttonText: string;
  buttonLink: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HeroBannerSchema = new Schema<IHeroBanner>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    cloudinaryId: { type: String, default: "" },
    buttonText: { type: String, default: "Shop Now" },
    buttonLink: { type: String, default: "/products" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export default models.HeroBanner ||
  mongoose.model<IHeroBanner>("HeroBanner", HeroBannerSchema);
