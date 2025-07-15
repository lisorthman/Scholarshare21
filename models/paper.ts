import mongoose, { Schema, Document } from 'mongoose';

// Define the interface for the Paper document
interface IPaper extends Document {
  title: string;
  details: string;
  submittedDate: Date;
  owner: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionDetails: {
    reason?: string;
    comments?: string;
    rejectedAt?: Date;
    grammarIssues?: string[];
    metadataIssues?: string[];
  };
}

const paperSchema: Schema = new mongoose.Schema<IPaper>({
  title: { type: String, required: true },
  details: { type: String, required: true },
  submittedDate: { type: Date, default: Date.now },
  owner: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  rejectionDetails: {
    reason: { type: String, default: null },
    comments: { type: String, default: null },
    rejectedAt: { type: Date, default: null },
    grammarIssues: { type: [String], default: [] },
    metadataIssues: { type: [String], default: [] },
  },
});

// Avoid overwriting the model in development (due to Next.js hot reloading)
const Paper = mongoose.models.Paper || mongoose.model<IPaper>('Paper', paperSchema);

export default Paper;