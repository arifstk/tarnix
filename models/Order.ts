// // models/Order.ts
// import mongoose, { Schema, Document, models } from "mongoose";

// export interface IOrderDoc extends Document {
//   user?: mongoose.Types.ObjectId;
//   items: {
//     productId: mongoose.Types.ObjectId;
//     name: string;
//     price: number;
//     quantity: number;
//     image: string;
//   }[];
//   shippingAddress: {
//     fullName: string;
//     phone: string;
//     address: string;
//     city: string;
//     postalCode: string;
//     country: string;
//   };
//   paymentMethod: "stripe" | "cod";
//   paymentStatus: "pending" | "paid" | "failed";
//   orderStatus: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
//   stripePaymentIntentId?: string;
//   subtotal: number;
//   total: number;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const OrderSchema = new Schema<IOrderDoc>(
//   {
//     user: { type: Schema.Types.ObjectId, ref: "User" },
//     items: [
//       {
//         productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
//         name: { type: String, required: true },
//         price: { type: Number, required: true },
//         quantity: { type: Number, required: true },
//         image: { type: String, default: "" },
//       },
//     ],
//     shippingAddress: {
//       fullName: { type: String, required: true },
//       phone: { type: String, required: true },
//       address: { type: String, required: true },
//       city: { type: String, required: true },
//       postalCode: { type: String, required: true },
//       country: { type: String, required: true },
//     },
//     paymentMethod: { type: String, enum: ["stripe", "cod"], required: true },
//     paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
//     orderStatus: {
//       type: String,
//       enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
//       default: "pending",
//     },
//     stripePaymentIntentId: { type: String },
//     subtotal: { type: Number, required: true },
//     total: { type: Number, required: true },
//   },
//   { timestamps: true }
// );

// export default models.Order || mongoose.model<IOrderDoc>("Order", OrderSchema);

// models/Order.ts
// CHANGELOG: Added userEmail for user-order linking, reviews[] for post-delivery reviews

import mongoose, { Schema, Document, models } from "mongoose";

export interface IOrderDoc extends Document {
  userEmail?: string;
  items: {
    productId: mongoose.Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }[];
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: "stripe" | "cod";
  paymentStatus: "pending" | "paid" | "failed";
  orderStatus:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  stripePaymentIntentId?: string;
  subtotal: number;
  total: number;
  reviews: {
    productId: mongoose.Types.ObjectId;
    rating: number;
    comment: string;
    submittedAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrderDoc>(
  {
    userEmail: { type: String, default: null },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, default: "" },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: { type: String, enum: ["stripe", "cod"], required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    stripePaymentIntentId: { type: String },
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },
    reviews: [
      {
        productId: { type: Schema.Types.ObjectId, ref: "Product" },
        rating: { type: Number, min: 1, max: 5, required: true },
        comment: { type: String, default: "" },
        submittedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true },
);

export default models.Order || mongoose.model<IOrderDoc>("Order", OrderSchema);
