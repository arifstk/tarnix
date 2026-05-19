// models/Category.ts — Category schema

import mongoose, { Schema, Document, models } from "mongoose";

export interface ICategoryDoc extends Document {
  name: string;
  slug: string;
}

const CategorySchema = new Schema<ICategoryDoc>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export default models.Category ||
  mongoose.model<ICategoryDoc>("Category", CategorySchema);


  