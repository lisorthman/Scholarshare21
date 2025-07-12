// models/MilestoneConfig.ts
import mongoose, { Schema, Document } from 'mongoose';

interface Threshold {
  level: number;
  threshold: number;
  reward: string;
}

interface IMilestoneConfig extends Document {
  UPLOADS: Threshold[];
  APPROVALS: Threshold[];
  DOWNLOADS: Threshold[];
}

const MilestoneConfigSchema = new Schema<IMilestoneConfig>({
  UPLOADS: [{
    level: { type: Number, required: true },
    threshold: { type: Number, required: true },
    reward: { type: String, required: true }
  }],
  APPROVALS: [{
    level: { type: Number, required: true },
    threshold: { type: Number, required: true },
    reward: { type: String, required: true }
  }],
  DOWNLOADS: [{
    level: { type: Number, required: true },
    threshold: { type: Number, required: true },
    reward: { type: String, required: true }
  }]
});

export default mongoose.models.MilestoneConfig || 
  mongoose.model<IMilestoneConfig>('MilestoneConfig', MilestoneConfigSchema);