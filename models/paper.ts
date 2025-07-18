import mongoose, { Document, Schema } from 'mongoose';

export interface IPaper extends Document {
  title: string;
  authors: string[];
  abstract: string;
  publicationDate: Date;
  downloadUrl: string;
  thumbnailUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  rating?: number;
  averageRating?: number;
  downloadCount: number;
  // Add any other fields you need
}

const PaperSchema: Schema = new Schema({
  title: { type: String, required: true },
  authors: { type: [String], required: true },
  abstract: { type: String, required: true },
  publicationDate: { type: Date, required: true },
  downloadUrl: { type: String, required: true },
  thumbnailUrl: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rating: { type: Number },
  averageRating: { type: Number },
  downloadCount: { type: Number, default: 0 },
  // Add any other fields you need
});

export default mongoose.models.Paper || mongoose.model<IPaper>('Paper', PaperSchema);