export type Paper = {

  id: string;
  title: string;
  abstract: string;
  author: string;
  authorId?: string;
  keywords: string[];
  category?: string;
  createdAt: Date;
  downloads?: number;
  fileUrl: string;
  fileType: string; 
  fileSize: number;
};

