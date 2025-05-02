import { Schema, model, models, Types, Document } from 'mongoose';

export interface ResearchPaperDocument extends Document {
  title: string;
  abstract?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  authorId: Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  category: string;
  keywords?: string[];
  readerStats: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const ALLOWED_CATEGORIES = [
  'Computer Science',
  'Biology',
  'Physics',
  'Chemistry',
  'Engineering',
  'Mathematics',
  'Medicine',
  'Social Sciences',
  'Other',
  'Uncategorized',
] as const;

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
        values: ['pending', 'approved', 'rejected'],
        message: 'Invalid status value',
      },
      default: 'pending',
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: ALLOWED_CATEGORIES,
        message: `Invalid category. Allowed values: ${ALLOWED_CATEGORIES.join(', ')}`,
      },
      default: 'Uncategorized',
      trim: true,
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
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret._id = ret._id.toString();
        ret.authorId = ret.authorId.toString();
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

ResearchPaperSchema.index({ title: 'text', abstract: 'text' });
ResearchPaperSchema.index({ authorId: 1 });
ResearchPaperSchema.index({ status: 1 });
ResearchPaperSchema.index({ category: 1 });
ResearchPaperSchema.index({ createdAt: -1 });

console.log('ResearchPaper model file loaded');
export default models.ResearchPaper || model<ResearchPaperDocument>('ResearchPaper', ResearchPaperSchema);