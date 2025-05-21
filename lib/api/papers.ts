import  connectToDB  from '@/lib/mongoose';
import { models } from 'mongoose';
import ResearchPaper from '@/models/ResearchPaper';
import AdminCategory from '@/models/AdminCategory';
import { Types } from 'mongoose';

// Initialize models if not already registered
async function ensureModels() {
  if (!models.ResearchPaper) {
    await import('@/models/ResearchPaper');
  }
  if (!models.AdminCategory) {
    await import('@/models/AdminCategory');
  }
}

// Single definition of getApprovedPapers
export const getApprovedPapers = async (filters = {}) => {
  await connectToDB();
  await ensureModels();
  
  return await ResearchPaper.find({ 
    status: "approved",
    ...filters 
  })
  .populate('author', 'name email')
  .populate('categoryId', 'name') // Changed from categoryDetails to categoryId
  .sort({ createdAt: -1 });
};

// Get single paper by ID
export const getPaperById = async (id: string) => {
  await connectToDB();
  await ensureModels();
  
  if (!Types.ObjectId.isValid(id)) {
    return null;
  }

  return await ResearchPaper.findById(id)
    .populate('author', 'name email')
    .populate('categoryId', 'name');
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