import { Schema, model, models, Types, Document } from 'mongoose';


export interface Review {
  userId: Types.ObjectId;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
}

export interface ResearchPaperDocument extends Document {
  title: string;
  abstract?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  authorId: Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected' | 'rejected_plagiarism' | 'rejected_ai' | 'passed_checks';
  category: string;
  categoryId: Types.ObjectId;
  keywords?: string[];
  readerStats: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
  blobKey: string;
  plagiarismScore?: number;
  aiScore?: number;
  rejectionReason?: string;
  reviews: Review[];
  downloadCount: number;
  viewCount: number;
  averageRating?: number;
}

const ReviewSchema = new Schema<Review>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ResearchPaperSchema = new Schema<ResearchPaperDocument>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    abstract: {
      type: String,
      trim: true,
      maxlength: [2000, 'Abstract cannot exceed 2000 characters'],
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      validate: {
        validator: (v: string) => /^https?:\/\//.test(v),
        message: 'Invalid file URL format',
      },
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: [1, 'File size must be at least 1 byte'],
    },
    fileType: {
      type: String,
      required: [true, 'File type is required'],
      enum: {
        values: [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
        message: 'Invalid file type',
      },
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author ID is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'rejected_plagiarism', 'rejected_ai', 'passed_checks'],
      default: 'pending',
    },
    category: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'AdminCategory',
      required: [true, 'Category reference is required'],
    },
    keywords: {
      type: [String],
      trim: true,
      default: [],
    },
    readerStats: {
      type: Map,
      of: Number,
      default: () => new Map<string, number>(),
    },
    blobKey: {
      type: String,
    },
    plagiarismScore: {
      type: Number,
    },
    aiScore: {
      type: Number,
    },
    rejectionReason: {
      type: String,
    },
    reviews: {
      type: [ReviewSchema],
      default: [],
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        ret.authorId = ret.authorId.toString();
        ret.categoryId = ret.categoryId?.toString();
        
        // Handle readerStats Map conversion safely
        if (ret.readerStats instanceof Map) {
          ret.readerStats = Object.fromEntries(ret.readerStats.entries());
        } else if (ret.readerStats && typeof ret.readerStats === 'object') {
          // Already a plain object
          ret.readerStats = ret.readerStats;
        } else {
          ret.readerStats = {};
        }
        
        if (ret.reviews) {
          ret.reviews = ret.reviews.map((r: any) => ({
            ...r,
            userId: r.userId.toString(),
            createdAt: r.createdAt?.toISOString(),
          }));
        }
        if (ret.authorId) {
    ret.authorId = ret.authorId.toString();
  } else {
    ret.authorId = null; // or ret.authorId = undefined;
  }
   ret.categoryId = ret.categoryId?.toString();
   if (ret.readerStats && ret.readerStats instanceof Map) {
    ret.readerStats = Object.fromEntries(ret.readerStats);
  }
  
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Virtuals
ResearchPaperSchema.virtual('author', {
  ref: 'User',
  localField: 'authorId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name email avatar' }
});

ResearchPaperSchema.virtual('categoryDetails', {
  ref: 'AdminCategory',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name description' }
});

// Indexes
ResearchPaperSchema.index({ title: 'text', abstract: 'text', keywords: 'text' });
ResearchPaperSchema.index({ authorId: 1 });
ResearchPaperSchema.index({ status: 1 });
ResearchPaperSchema.index({ category: 1 });
ResearchPaperSchema.index({ categoryId: 1 });
ResearchPaperSchema.index({ createdAt: -1 });
ResearchPaperSchema.index({ averageRating: -1 });
ResearchPaperSchema.index({ downloadCount: -1 });

// Pre-save hook to calculate average rating
ResearchPaperSchema.pre('save', function (next) {
  if (this.reviews && this.reviews.length > 0) {
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = parseFloat((total / this.reviews.length).toFixed(1));
  } else {
    this.averageRating = undefined;
  }
  next();
});

const ResearchPaper = models.ResearchPaper || model<ResearchPaperDocument>('ResearchPaper', ResearchPaperSchema);

export default ResearchPaper;