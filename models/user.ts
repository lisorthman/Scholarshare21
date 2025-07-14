import { Schema, model, models, Document, Types } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: string;
  researchField?: string;
  profilePhoto?: string;
  savedPapers: Types.ObjectId[];
  recentlyViewed: { paperId: Types.ObjectId; timestamp: Date }[];
  username?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date | null;
  isVerified?: boolean;
  // OAuth fields
  googleId?: string;
  facebookId?: string;
  status: string; // Added for approval workflow
  // Milestone fields
  counts: {
    uploads: number;
    approvals: number;
    downloads: number;
  };
  badges: string[];
  educationQualification?: string; // Added for researchers
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Optional for OAuth users
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
    lastLogin: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },
    // OAuth fields
    googleId: { type: String, sparse: true },
    facebookId: { type: String, sparse: true },
    status: { type: String, required: true, enum: ["Pending", "Active", "Suspended"], default: "Pending" }, // Added
    // Milestone tracking
    counts: {
      uploads: { type: Number, default: 0 },
      approvals: { type: Number, default: 0 },
      downloads: { type: Number, default: 0 },
    },
    badges: { type: [String], default: [] },
    educationQualification: { type: String, default: null }, // Added for researchers
  },
  { timestamps: true }
);

console.log("User model file loaded");
const User = models.User || model<IUser>("User", UserSchema);
export default User;