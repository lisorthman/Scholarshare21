import { Schema, model, models, Document, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  role: string;
  researchField?: string;
  profilePhoto?: string;
  savedPapers: Types.ObjectId[];
  recentlyViewed: { paperId: Types.ObjectId; timestamp: Date }[];
  username?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date | null; // Added lastLogin field
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: {
      type: String,
      required: true,
      enum: ["admin", "user", "researcher"],
      default: "user",
    },
    researchField: { type: String, default: "Uncategorized" },
    profilePhoto: { type: String, default: null },
    savedPapers: [
      {
        type: Schema.Types.ObjectId,
        ref: "ResearchPaper",
      },
    ],
    recentlyViewed: [
      {
        paperId: {
          type: Schema.Types.ObjectId,
          ref: "ResearchPaper",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    username: { type: String, unique: true, sparse: true },
    lastLogin: { type: Date, default: null }, // Added lastLogin field
  },
  { timestamps: true }
);

console.log("User model file loaded");
const User = models.User || model<IUser>("User", UserSchema);
export default User;