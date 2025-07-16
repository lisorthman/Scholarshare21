import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for the Paper document
interface IPaper extends Document {
  title: string;
  authorId: string;
  authorName?: string;
  description?: string;
  content?: string;
  fileUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  views: number;
  downloads: number;
  tags?: string[];
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paperSchema: Schema = new mongoose.Schema<IPaper>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    authorId: {
      type: String,
      required: true,
    },
    authorName: {
      type: String,
    },
    description: {
      type: String,
    },
    content: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    tags: [{ type: String }],
    category: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Avoid overwriting the model in development (due to Next.js hot reloading)
const Paper =
  mongoose.models.Paper || mongoose.model<IPaper>('Paper', paperSchema);

export default Paper;