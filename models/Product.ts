// // models/Product.ts — Product schema with Cloudinary image fields

// import mongoose, { Schema, Document, models } from "mongoose";

// export interface IProductDoc extends Document {
//   name: string;
//   description: string;
//   price: number;
//   imageUrl: string;
//   cloudinaryId: string;
//   category: mongoose.Types.ObjectId;
// }

// const ProductSchema = new Schema<IProductDoc>(
//   {
//     name: { type: String, required: true },
//     description: { type: String, required: true },
//     price: { type: Number, required: true },
//     imageUrl: { type: String, required: true },
//     cloudinaryId: { type: String, required: true },
//     category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
//   },
//   { timestamps: true },
// );

// export default models.Product ||
//   mongoose.model<IProductDoc>("Product", ProductSchema);

// -----------------------------

// // models/Product.ts

// import mongoose, { Schema, Document, models } from "mongoose";

// export interface IProductDoc extends Document {
//   name: string;
//   description: string;
//   price: number;
//   discountRate: number; // percentage, e.g. 15 means 15%
//   discountedPrice: number; // virtual — stored for fast queries
//   stock: number;
//   imageUrl: string;
//   cloudinaryId: string;
//   category: mongoose.Types.ObjectId;
//   status: "active" | "draft";
//   tags: string[];
//   sku: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const ProductSchema = new Schema<IProductDoc>(
//   {
//     name: { type: String, required: true, trim: true },
//     description: { type: String, required: true },
//     price: { type: Number, required: true, min: 0 },
//     discountRate: { type: Number, default: 0, min: 0, max: 100 },
//     discountedPrice: { type: Number, default: 0 }, // updated via pre-save hook
//     stock: { type: Number, required: true, default: 0, min: 0 },
//     imageUrl: { type: String, required: true },
//     cloudinaryId: { type: String, required: true },
//     category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
//     status: { type: String, enum: ["active", "draft"], default: "active" },
//     tags: { type: [String], default: [] },
//     sku: { type: String, default: "" },
//   },
//   { timestamps: true },
// );

// // Auto-compute discountedPrice before every save
// ProductSchema.pre("save", function () {
//   this.discountedPrice =
//     this.discountRate > 0
//       ? parseFloat((this.price * (1 - this.discountRate / 100)).toFixed(2))
//       : this.price;
// });

// // Same hook for findOneAndUpdate / updateOne
// ProductSchema.pre(["findOneAndUpdate", "updateOne"], function (next) {
//   const update = this.getUpdate() as Partial<IProductDoc> & {
//     $set?: Partial<IProductDoc>;
//   };
//   const data = update.$set ?? update;
//   const price = data.price as number | undefined;
//   const discountRate = data.discountRate as number | undefined;

//   if (price !== undefined || discountRate !== undefined) {
//     // We need both values; fetch from the update object or rely on caller providing them
//     const p = price ?? 0;
//     const dr = discountRate ?? 0;
//     const discountedPrice =
//       dr > 0 ? parseFloat((p * (1 - dr / 100)).toFixed(2)) : p;
//     if (update.$set) update.$set.discountedPrice = discountedPrice;
//     else (update as any).discountedPrice = discountedPrice;
//   }
// });

// export default models.Product ||
//   mongoose.model<IProductDoc>("Product", ProductSchema);


// ----------------------------------------------------------

// models/Product.ts
// FIX: Replaced next()-based pre-save hooks with async hooks (return instead of next()).
// In some Next.js/webpack bundling environments, Mongoose passes a non-function as `next`,
// crashing the hook. Using async functions avoids the `next` parameter entirely.

import mongoose, { Schema, Document, models } from "mongoose";

export interface IProductDoc extends Document {
  name: string;
  description: string;
  price: number;
  discountRate: number;
  discountedPrice: number;
  stock: number;
  imageUrl: string;
  cloudinaryId: string;
  category: mongoose.Types.ObjectId;
  status: "active" | "draft";
  tags: string[];
  sku: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDoc>(
  {
    name:           { type: String, required: true, trim: true },
    description:    { type: String, required: true },
    price:          { type: Number, required: true, min: 0 },
    discountRate:   { type: Number, default: 0, min: 0, max: 100 },
    discountedPrice:{ type: Number, default: 0 },
    stock:          { type: Number, required: true, default: 0, min: 0 },
    imageUrl:       { type: String, required: true },
    cloudinaryId:   { type: String, required: true },
    category:       { type: Schema.Types.ObjectId, ref: "Category", required: true },
    status:         { type: String, enum: ["active", "draft"], default: "active" },
    tags:           { type: [String], default: [] },
    sku:            { type: String, default: "" },
  },
  { timestamps: true },
);

// FIX: async hook — no `next` parameter, just return when done
ProductSchema.pre("save", async function () {
  this.discountedPrice =
    this.discountRate > 0
      ? parseFloat((this.price * (1 - this.discountRate / 100)).toFixed(2))
      : this.price;
});

// FIX: async hook for findOneAndUpdate / updateOne
ProductSchema.pre(["findOneAndUpdate", "updateOne"], async function () {
  const update = this.getUpdate() as Partial<IProductDoc> & {
    $set?: Partial<IProductDoc>;
  };
  const data = update.$set ?? update;
  const price        = data.price        as number | undefined;
  const discountRate = data.discountRate as number | undefined;

  if (price !== undefined || discountRate !== undefined) {
    const p  = price        ?? 0;
    const dr = discountRate ?? 0;
    const discountedPrice =
      dr > 0 ? parseFloat((p * (1 - dr / 100)).toFixed(2)) : p;

    if (update.$set) {
      update.$set.discountedPrice = discountedPrice;
    } else {
      (update as any).discountedPrice = discountedPrice;
    }
  }
});

export default models.Product ||
  mongoose.model<IProductDoc>("Product", ProductSchema);