import { NextApiRequest, NextApiResponse } from 'next';
import User from '@/models/user';
import connectDB from "@/lib/mongoose";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.headers.authorization?.split(' ')[1] || req.body.token || req.query.token;
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    // Verify the token
    const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/verify-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    const verifyData = await verifyResponse.json();
    
    // Allow both admin and researcher roles
    if (!verifyData.valid || !['admin', 'researcher'].includes(verifyData.user.role)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Fetch the user from the database
    const user = await User.findOne({ _id: verifyData.user._id });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}