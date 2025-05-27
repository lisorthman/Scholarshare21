import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema({
  paperId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ResearchPaper", 
    required: true 
  },
  reviewerName: {
    type: String,
    default: "Anonymous" // Default name if not provided
  },
  message: { 
    type: String, 
    required: true 
  },
  rating: { 
    type: Number, 
    required: true,
    min: 1, 
    max: 5 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
  // Removed reviewerId since we don't require user auth
});

export default mongoose.models.Review || mongoose.model("Review", reviewSchema);