import connectToDB from '@/lib/mongodb'; // Make sure this path is correct
import Category from '@/models/Category';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await connectToDB();

    const { name, contents } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Name is required' });
    }

    const newCategory = new Category({
      name,
      contents: contents || [],
    });

    await newCategory.save();

    res.status(201).json({ success: true, category: newCategory });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
}
