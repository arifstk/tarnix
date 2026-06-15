// models/DeliveryAssignment.ts

import mongoose, { models, Schema } from "mongoose";

export interface IDeliveryAssignment extends Document {
  orderId: mongoose.Types.ObjectId;
  deliveryBoyEmail: string;
  deliveryBoyName: string;
  status: "accepted" | "picked-up" | "on-the-way" | "delivered";
  acceptedAt: Date;
  deliveredAt?: Date;
}

const DeliveryAssignmentSchema = new Schema<IDeliveryAssignment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    deliveryBoyEmail: { type: String, required: true },
    deliveryBoyName: { type: String, required: true },
    status: {
      type: String,
      enum: ["accepted", "picked-up", "on-the-way", "delivered"],
      default: "accepted",
    },
    acceptedAt: { type: Date, default: Date.now },
    deliveredAt: { type: Date },
  },
  { timestamps: true },
);

export default models.DeliveryAssignment ||
  mongoose.model<IDeliveryAssignment>(
    "DeliveryAssignment",
    DeliveryAssignmentSchema,
  );
