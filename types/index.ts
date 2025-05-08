export type Paper = {
  id: string;
  title: string;
  abstract: string;
  author: string;
  keywords: string[];
  category?: string;
  createdAt: Date;
  downloads?: number;
};