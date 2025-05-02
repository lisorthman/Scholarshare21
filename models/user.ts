import { Schema, model, models, Document, Types } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  role: string;
  researchField?: string;
  savedPapers: Types.ObjectId[];
  recentlyViewed: { paperId: Types.ObjectId; timestamp: Date }[];
  username?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true, enum: ['admin', 'user', 'researcher'], default: 'user' },
    researchField: { type: String, default: 'Uncategorized' },
    savedPapers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ResearchPaper',
      },
    ],
    recentlyViewed: [
      {
        paperId: {
          type: Schema.Types.ObjectId,
          ref: 'ResearchPaper',
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    username: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

console.log('User model file loaded');
const User = models.User || model<IUser>('User', UserSchema);
export default User;