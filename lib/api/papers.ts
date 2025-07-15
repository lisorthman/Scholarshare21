import connectToDB from '@/lib/mongoose';
import { models } from 'mongoose';
import ResearchPaper from '@/models/ResearchPaper';
import AdminCategory from '@/models/AdminCategory';
import { Types } from 'mongoose';
import type { Document } from 'mongoose';

interface PaperDocument extends Document {
  _id: Types.ObjectId;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  author: Types.ObjectId | { _id: Types.ObjectId; name: string; email: string };
  categoryId: Types.ObjectId | { _id: Types.ObjectId; name: string };
  createdAt: Date;
  updatedAt: Date;
  downloads?: number;
  // Add other fields as needed
}

interface PlainPaper {
  _id: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  author?: { _id: string; name: string; email: string };
  categoryId?: { _id: string; name: string };
  createdAt: string;
  updatedAt: string;
  downloads?: number;
  // Add other fields as needed
}

// Initialize models if not already registered
async function ensureModels(): Promise<void> {
  if (!models.ResearchPaper) {
    await import('@/models/ResearchPaper');
  }
  if (!models.AdminCategory) {
    await import('@/models/AdminCategory');
  }
}

// Convert Mongoose document to plain object
function toPlainObject(doc: PaperDocument | null): PlainPaper | null {
  if (!doc) return null;
  
  const plainDoc = doc.toObject ? doc.toObject() : doc;
  
  return {
    ...plainDoc,
    _id: plainDoc._id.toString(),
    author: plainDoc.author && '_id' in plainDoc.author ? {
      _id: plainDoc.author._id.toString(),
      name: plainDoc.author.name,
      email: plainDoc.author.email
    } : undefined,
    categoryId: plainDoc.categoryId && '_id' in plainDoc.categoryId ? {
      _id: plainDoc.categoryId._id.toString(),
      name: plainDoc.categoryId.name
    } : undefined,
    createdAt: plainDoc.createdAt.toISOString(),
    updatedAt: plainDoc.updatedAt.toISOString()
  };
}

// Get approved papers with optional filters
export const getApprovedPapers = async (filters = {}): Promise<PlainPaper[]> => {
  await connectToDB();
  await ensureModels();
  
  const papers = await ResearchPaper.find({ 
    status: "approved",
    ...filters 
  })
  .populate('author', 'name')
  .populate('categoryId', 'name')
  .sort({ createdAt: -1 })
  .lean<PaperDocument[]>();

  return papers.map(toPlainObject) as PlainPaper[];
};

// Get single paper by ID
export const getPaperById = async (id: string): Promise<PlainPaper | null> => {
  await connectToDB();
  await ensureModels();
  
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const paper = await ResearchPaper.findById(id)
    .populate('author', 'name email')
    .populate('categoryId', 'name')
    .lean<PaperDocument>();

  return toPlainObject(paper);
};

// Increment download count
export const incrementDownloadCount = async (id: string): Promise<PlainPaper | null> => {
  await connectToDB();
  
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  const paper = await ResearchPaper.findByIdAndUpdate(
    id,
    { $inc: { downloads: 1 } },
    { new: true }
  ).lean<PaperDocument>();

  return toPlainObject(paper);
};

// Search papers with text query
export const searchPapers = async (query: string): Promise<PlainPaper[]> => {
  await connectToDB();
  
  if (!query || typeof query !== 'string') {
    return [];
  }

  const papers = await ResearchPaper.find(
    { $text: { $search: query }, status: 'approved' },
    { score: { $meta: "textScore" } }
  )
  .sort({ score: { $meta: "textScore" } })
  .populate('author', 'name')
  .limit(20)
  .lean<PaperDocument[]>();

  return papers.map(toPlainObject) as PlainPaper[];
};