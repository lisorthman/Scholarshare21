import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '@/lib/mongoose';
import ResearcherEarnings from '@/models/ResearcherEarnings';
import User from '@/models/user';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const earnings = await ResearcherEarnings.findOne({
      userId: session.user.id
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      bankAccount: earnings?.bankAccount || null,
      paymentHistory: earnings?.paymentHistory || []
    });

  } catch (error) {
    console.error('Payments fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Parse and validate bank details
    const { bankDetails } = await req.json();
    
    if (!bankDetails || !bankDetails.accountHolder || !bankDetails.bankName || 
        !bankDetails.accountNumber || !bankDetails.routingNumber) {
      return NextResponse.json(
        { error: 'All bank details fields are required' },
        { status: 400 }
      );
    }

    // Find user and verify
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create or update earnings record with user's actual ID
    const earnings = await ResearcherEarnings.findOneAndUpdate(
      { userId: user._id }, // Use actual user._id instead of session.user.id
      {
        $set: {
          userId: user._id,
          bankAccount: {
            accountHolder: bankDetails.accountHolder,
            bankName: bankDetails.bankName,
            accountNumber: bankDetails.accountNumber,
            routingNumber: bankDetails.routingNumber
          },
          totalEarnings: (user.counts?.uploads || 0) * 1,
          availableBalance: (user.counts?.uploads || 0) * 1
        }
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );

    if (!earnings) {
      throw new Error('Failed to save earnings record');
    }

    return NextResponse.json({
      success: true,
      data: {
        bankAccount: earnings.bankAccount,
        totalEarnings: earnings.totalEarnings,
        availableBalance: earnings.availableBalance
      }
    });

  } catch (error) {
    console.error('Save bank details error:', error);
    return NextResponse.json(
      { error: 'Failed to save bank details' },
      { status: 500 }
    );
  }
}