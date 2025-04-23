// models/ResearchPaper.ts
import { Schema, model, models } from 'mongoose';

// Define possible categories (adjust as needed)
const CATEGORIES = [
  'Computer Science',
  'Engineering',
  'Mathematics',
  'Physics',
  'Biology',
  'Chemistry',
  'Medicine',
  'Social Sciences',
  'Humanities',
  'Business',
  'Other'
];

const ResearchPaperSchema = new Schema({
  title: { type: String, required: [true, 'Title is required'] },
  abstract: { type: String, required: [true, 'Abstract is required'] },
  fileUrl: { type: String, required: [true, 'File URL is required'] }, // Vercel Blob URL
  fileName: { type: String, required: [true, 'File name is required'] },
  fileSize: { type: Number, required: [true, 'File size is required'] },
  fileType: { type: String, required: [true, 'File type is required'] },
  authorId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Author ID is required'] 
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'],
    enum: {
      values: CATEGORIES,
      message: '{VALUE} is not a valid category'
    }
  },
  keywords: [{ 
    type: String,
    validate: {
      validator: function(v: string) {
        return v.length <= 50; // Max keyword length
      },
      message: 'Keyword cannot be longer than 50 characters'
    }
  }],
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

export default models.ResearchPaper || model('ResearchPaper', ResearchPaperSchema);