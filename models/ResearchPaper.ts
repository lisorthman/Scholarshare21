import { Schema, model, models } from 'mongoose';
import { ObjectId } from 'mongodb';

interface ResearchPaperDocument {
  title: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  authorId: typeof ObjectId;
  status: 'pending' | 'approved' | 'rejected';
}

const ResearchPaperSchema = new Schema<ResearchPaperDocument>({
  title: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  fileSize: { type: Number, required: true },
  fileType: { type: String, required: true },
  authorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    validate: {
      validator: (v: any) => ObjectId.isValid(v),
      message: 'Invalid author ID format'
    }
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  }
}, { timestamps: true });

export default models.ResearchPaper || model('ResearchPaper', ResearchPaperSchema);