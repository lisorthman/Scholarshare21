// models/Category.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  contents: string[];
  joinedDate: Date;
}

const CategorySchema: Schema = new Schema({
  name: { type: String, required: true },
  contents: { type: [String], default: [] },
  joinedDate: { type: Date, default: Date.now },
});

const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
