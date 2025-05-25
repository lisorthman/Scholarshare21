import connectToDB from '@/lib/mongoose';
import ResearchPaper from '@/models/ResearchPaper';
import { Types } from 'mongoose';

// Get all approved papers with optional filters
export const getApprovedPapers = async (filters = {}) => {
  await connectToDB();
  
  return await ResearchPaper.find({ 
    status: 'approved',
    ...filters 
  })
  .populate('author', 'name email')
  .populate('categoryDetails', 'name')
  .sort({ createdAt: -1 });
};

// Get single paper by ID
export const getPaperById = async (id: string) => {
  await connectToDB();
  
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  return await ResearchPaper.findById(id)
    .populate('author', 'name email')
    .populate('categoryDetails', 'name');
};

// Increment download count
export const incrementDownloadCount = async (id: string) => {
  await connectToDB();
  
  return await ResearchPaper.findByIdAndUpdate(
    id,
    { $inc: { downloads: 1 } },
    { new: true }
  );
};

// Other paper-related API functions...
export const searchPapers = async (query: string) => {
  await connectToDB();
  
  return await ResearchPaper.find(
    { $text: { $search: query }, status: 'approved' },
    { score: { $meta: "textScore" } }
  )
  .sort({ score: { $meta: "textScore" } })
  .populate('author', 'name')
  .limit(20);
};