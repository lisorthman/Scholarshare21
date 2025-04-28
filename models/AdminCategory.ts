import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdminCategory extends Document {
  name: string;
  description: string;
  parentCategory: mongoose.Types.ObjectId | null;
  createdAt: Date;
}

const AdminCategorySchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  parentCategory: { type: Schema.Types.ObjectId, ref: 'AdminCategory', default: null },
  createdAt: { type: Date, default: Date.now },
});

const AdminCategory: Model<IAdminCategory> = mongoose.models.AdminCategory || mongoose.model<IAdminCategory>('AdminCategory', AdminCategorySchema);

export default AdminCategory;