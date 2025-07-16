import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Payment from '@/models/payment';
import User from '@/models/user';
import { isValidObjectId } from 'mongoose';

export async function POST(request: Request) {
  try {
    const { researcherId, amount, bankDetails } = await request.json();

    await connectDB();

    let researcher;
    
    // If researcherId is provided and valid, use it
    if (researcherId && isValidObjectId(researcherId)) {
      researcher = await User.findById(researcherId);
    } else {
      // Otherwise, get the first researcher (for demo purposes)
      researcher = await User.findOne({ role: 'researcher' });
    }

    if (!researcher) {
      return NextResponse.json(
        { error: 'No researcher found' },
        { status: 404 }
      );
    }

    if (!amount || amount < 20) {
      return NextResponse.json(
        { error: 'Minimum withdrawal amount is $20' },
        { status: 400 }
      );
    }

    if (!bankDetails || !bankDetails.accountNumber || !bankDetails.bankName) {
      return NextResponse.json(
        { error: 'Bank details are required for withdrawal' },
        { status: 400 }
      );
    }

    const paymentRecord = await Payment.findOne({ researcherId: researcher._id.toString() });
    
    if (!paymentRecord) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    if (paymentRecord.earnings.availableBalance < amount) {
      return NextResponse.json(
        { error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Process withdrawal
    const withdrawalId = `WD${Date.now()}`;
    
    paymentRecord.earnings.availableBalance -= amount;
    paymentRecord.earnings.totalWithdrawn += amount;
    
    paymentRecord.withdrawals.push({
      id: withdrawalId,
      amount,
      currency: 'USD',
      status: 'completed', // In real app, this would be 'pending' initially
      requestedAt: new Date(),
      processedAt: new Date(),
      bankDetails: {
        accountNumber: bankDetails.accountNumber,
        bankName: bankDetails.bankName
      }
    });

    // Update bank details if provided
    if (bankDetails) {
      paymentRecord.bankDetails = {
        ...paymentRecord.bankDetails,
        ...bankDetails
      };
    }

    await paymentRecord.save();

    return NextResponse.json({
      success: true,
      message: 'Withdrawal processed successfully',
      withdrawalId,
      newBalance: paymentRecord.earnings.availableBalance
    });

  } catch (error) {
    console.error('[WITHDRAWAL API ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to process withdrawal' },
      { status: 500 }
    );
  }
}