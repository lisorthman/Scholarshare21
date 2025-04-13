// models/ResearchPaper.ts
import { Schema, model, models } from 'mongoose';

const ResearchPaperSchema = new Schema({
  title: { type: String, required: true },
  abstract: { type: String },
  fileUrl: { type: String, required: true }, // Vercel Blob URL
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileType: { type: String, required: true },
  authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  keywords: [{ type: String }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default models.ResearchPaper || model('ResearchPaper', ResearchPaperSchema);