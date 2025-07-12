import { ObjectId } from 'mongodb';

export interface DbResearchPaper {
  categoryDetails: any;
  _id: ObjectId;
  title: string;
  abstract?: string;
  category: string; // Changed from researchField to match model
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  authorId: ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  readerStats?: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResearchPaper {
  categoryDetails: any;
  _id: string;
  title: string;
  abstract?: string;
  category: string; // Changed from researchField to match model
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  authorId: string;
  status: 'pending' | 'approved' | 'rejected';
  readerStats?: Record<string, number>; // Changed from Map to plain object for API
  createdAt: string;
  updatedAt: string;
}

// For create/update operations
export interface CreateResearchPaperDto {
  title: string;
  abstract?: string;
  category: string;
  file: File;
  authorId: string;
}

// For query filtering
export interface ResearchPaperFilter {
  category?: string;
  status?: 'pending' | 'approved' | 'rejected';
  authorId?: string;
  search?: string;
  page?: number;
  limit?: number;
}