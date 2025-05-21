// Models/review.ts
import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema({
  paperId: { type: mongoose.Schema.Types.ObjectId, ref: "ResearchPaper", required: true },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);
