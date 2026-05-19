// models/User.ts — User schema with role support

import mongoose, { Schema, Document, models } from "mongoose";

export interface IUserDoc extends Document {
  name: string;
  email: string;
  image?: string;
  password?: string;
  role: "user" | "admin";
}

const UserSchema = new Schema<IUserDoc>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String },
    password: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true },
);

export default models.User || mongoose.model<IUserDoc>("User", UserSchema);

