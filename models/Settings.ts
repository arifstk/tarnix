// models/Settings.ts

import mongoose, { Schema, Document, models } from "mongoose";

export interface ISettings extends Document {
  deliveryCharge: number;
  maintenanceMode: boolean;
  storeAddress: string;
  storePhone: string;
  storeEmail: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
}

const SettingsSchema = new Schema<ISettings>(
  {
    deliveryCharge: { type: Number, default: 0 },
    maintenanceMode: { type: Boolean, default: false },
    storeAddress: { type: String, default: "" },
    storePhone: { type: String, default: "" },
    storeEmail: { type: String, default: "" },
    facebook: { type: String, default: "" },
    instagram: { type: String, default: "" },
    twitter: { type: String, default: "" },
    youtube: { type: String, default: "" },
  },
  { timestamps: true },
);

export default models.Settings ||
  mongoose.model<ISettings>("Settings", SettingsSchema);
