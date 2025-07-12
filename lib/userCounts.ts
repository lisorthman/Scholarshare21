// lib/userCounts.ts
import User from '@/models/user';
import connectDB from '@/lib/mongoose';

export async function incrementUserCount(
  userId: string,
  field: 'uploads' | 'approvals' | 'downloads'
) {
  await connectDB();
  await User.findByIdAndUpdate(
    userId,
    { $inc: { [`counts.${field}`]: 1 } },
    { new: true }
  );
}