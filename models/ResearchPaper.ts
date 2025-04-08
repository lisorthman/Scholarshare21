import { Schema, model, models } from 'mongoose';
import { DbResearchPaper } from '@/types/research';

const ResearchPaperSchema = new Schema<DbResearchPaper>(
  {
    title: { type: String, required: true },
    abstract: String,
    researchField: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    fileType: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'], 
      default: 'pending' 
    },
  },
  { timestamps: true }
);

export default models.ResearchPaper || model<DbResearchPaper>('ResearchPaper', ResearchPaperSchema);