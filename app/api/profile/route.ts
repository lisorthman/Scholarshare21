import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/user'; // Adjust path based on your project structure
import connectDB from "@/lib/mongoose"; // Assuming you have a DB connection file

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB(); // Connect to MongoDB

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1] || req.body.token || req.query.token;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify the token (similar to your /api/verify-token logic)
    const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const verifyData = await verifyResponse.json();
    if (!verifyData.valid || verifyData.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Fetch the user (admin) from the database
    const admin = await User.findOne({ _id: verifyData.user._id });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}