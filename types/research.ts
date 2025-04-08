import { ObjectId } from 'mongodb';

export interface DbResearchPaper {
  _id: ObjectId;
  title: string;
  abstract?: string;
  researchField: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  authorId: ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResearchPaper {
  _id: string;
  title: string;
  abstract?: string;
  researchField: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  authorId: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}