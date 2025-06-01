// lib/api.ts
import { getDb } from './db';
import { Paper } from '@/types';

export async function getAllPapers(): Promise<Paper[]> {
  const db = await getDb();
  const papers = await db.collection('papers').find({}).toArray();

  // Convert MongoDB's ObjectId to string and ensure all Paper fields are present
  return papers.map(paper => ({
    id: paper._id.toString(),
    title: paper.title,
    abstract: paper.abstract,
    author: paper.author,
    keywords: paper.keywords,
    createdAt: paper.createdAt,
    category: paper.category ?? 'General', // optional, default to 'General'
    downloads: paper.downloads ?? 0 // optional, default to 0
  }));
}

export async function getCategories(): Promise<string[]> {
  const db = await getDb();
  const categories = await db.collection('categories').find({}).toArray();

  return categories.map(c => c.name);
}
