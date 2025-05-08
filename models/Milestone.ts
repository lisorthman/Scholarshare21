import mongoose, { Schema, Document } from 'mongoose';

export interface IMilestone extends Document {
  researcherId: string; // ID of the researcher
  title: string; // Milestone title
  description?: string; // Optional description
  date: Date; // Date the milestone was achieved
}

const MilestoneSchema = new Schema<IMilestone>({
  researcherId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
});

export default mongoose.models.Milestone || mongoose.model<IMilestone>('Milestone', MilestoneSchema);