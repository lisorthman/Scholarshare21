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
  views: number;
  downloads: number;
  viewedBy: Types.ObjectId[];
  downloadedBy: Types.ObjectId[];
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
      validate: {
        validator: (v: any) => Types.ObjectId.isValid(v),
        message: 'Invalid author ID format',
      },
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected', 'rejected_plagiarism', 'rejected_ai', 'passed_checks'],
        message: 'Invalid status value',
      },
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
      validate: {
        validator: (v: any) => Types.ObjectId.isValid(v),
        message: 'Invalid category ID format',
      },
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
    views: {
      type: Number,
      default: 0,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    viewedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: [],
      }
    ],
    downloadedBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: [],
      }
    ],
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
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret._id = ret._id.toString();
        ret.authorId = ret.authorId.toString();
        ret.categoryId = ret.categoryId?.toString();
        ret.viewedBy = ret.viewedBy?.map((id: any) => id.toString());
        ret.downloadedBy = ret.downloadedBy?.map((id: any) => id.toString());
        if (ret.reviews) {
          ret.reviews = ret.reviews.map((r: any) => ({
            ...r,
            userId: r.userId.toString(),
            createdAt: r.createdAt?.toISOString(),
          }));
        }
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Virtuals
ResearchPaperSchema.virtual('author', {
  ref: 'User',
  localField: 'authorId',
  foreignField: '_id',
  justOne: true,
});

ResearchPaperSchema.virtual('categoryDetails', {
  ref: 'AdminCategory',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true,
});

// Indexes
ResearchPaperSchema.index({ title: 'text', abstract: 'text' });
ResearchPaperSchema.index({ authorId: 1 });
ResearchPaperSchema.index({ status: 1 });
ResearchPaperSchema.index({ category: 1 });
ResearchPaperSchema.index({ categoryId: 1 });
ResearchPaperSchema.index({ createdAt: -1 });

export default models.ResearchPaper || model<ResearchPaperDocument>('ResearchPaper', ResearchPaperSchema);
