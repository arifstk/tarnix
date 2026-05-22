// models/Product.ts

import mongoose, { Schema, Document, models } from "mongoose";

export interface IProductDoc extends Document {
  name: string;
  description: string;
  price: number;
  discountRate: number;
  discountedPrice: number;
  stock: number;
  imageUrl: string;
  images: { url: string; cloudinaryId: string }[];
  cloudinaryId: string;
  category: mongoose.Types.ObjectId;
  status: "active" | "draft";
  tags: string[];
  sku: string;
  rating: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProductDoc>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountRate: { type: Number, default: 0, min: 0, max: 100 },
    discountedPrice: { type: Number, default: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    images: {
      type: [
        {
          url: { type: String, required: true },
          cloudinaryId: { type: String, required: true },
        },
      ],
      default: [],
      validate: {
        validator: (arr: unknown[]) => arr.length <= 4,
        message: "A product can have at most 4 images.",
      },
    },
    // imageUrl:       { type: String, required: true },
    // cloudinaryId:   { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    status: { type: String, enum: ["active", "draft"], default: "active" },
    tags: { type: [String], default: [] },
    sku: { type: String, default: "" },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

ProductSchema.virtual("imageUrl").get(function () {
  return this.images[0]?.url ?? "";
});
ProductSchema.virtual("cloudinaryId").get(function () {
  return this.images[0]?.cloudinaryId ?? "";
});

// Keep virtuals when calling .lean() or .toJSON()
ProductSchema.set("toJSON", { virtuals: true });
ProductSchema.set("toObject", { virtuals: true });

// async hook — no `next` parameter, just return when done
ProductSchema.pre("save", async function () {
  this.discountedPrice =
    this.discountRate > 0
      ? parseFloat((this.price * (1 - this.discountRate / 100)).toFixed(2))
      : this.price;
});

//  async hook for findOneAndUpdate / updateOne
ProductSchema.pre(["findOneAndUpdate", "updateOne"], async function () {
  const update = this.getUpdate() as Partial<IProductDoc> & {
    $set?: Partial<IProductDoc>;
  };
  // const data = update.$set ?? update;
  // const price        = data.price        as number | undefined;
  // const discountRate = data.discountRate as number | undefined;

  // if (price !== undefined || discountRate !== undefined) {
  //   const p  = price        ?? 0;
  //   const dr = discountRate ?? 0;
  //   const discountedPrice =
  //     dr > 0 ? parseFloat((p * (1 - dr / 100)).toFixed(2)) : p;

  //   if (update.$set) {
  //     update.$set.discountedPrice = discountedPrice;
  //   } else {
  //     (update as any).discountedPrice = discountedPrice;
  //   }
  const data = update.$set ?? update;
  const price = data.price as number | undefined;
  const discountRate = data.discountRate as number | undefined;
  if (price !== undefined || discountRate !== undefined) {
    const p = price ?? 0;
    const dr = discountRate ?? 0;
    const discountedPrice =
      dr > 0 ? parseFloat((p * (1 - dr / 100)).toFixed(2)) : p;
    if (update.$set) update.$set.discountedPrice = discountedPrice;
    else (update as any).discountedPrice = discountedPrice;
  }
});

export default models.Product ||
  mongoose.model<IProductDoc>("Product", ProductSchema);
