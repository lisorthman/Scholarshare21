import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import ResearchPaper from '@/models/ResearchPaper';
import AdminCategory from '@/models/AdminCategory'; // Add this import
import Payment from '@/models/payment';
import { getServerSession } from 'next-auth';

export async function GET(request: Request) {
  try {
    await connectDB();
    
    // Get researcher ID from session or query params
    const { searchParams } = new URL(request.url);
    let researcherId = searchParams.get('researcherId');
    
    // If no researcherId in params, try to get from session
    if (!researcherId) {
      return NextResponse.json({ error: 'Researcher ID is required' }, { status: 400 });
    }

    console.log('Fetching earnings for researcher:', researcherId);

    // Ensure AdminCategory model is loaded before the populate call
    await AdminCategory.find().limit(1);

    // Get all papers by this researcher from the CORRECT ResearchPaper model
    const papers = await ResearchPaper.find({ authorId: researcherId })
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${papers.length} papers for researcher ${researcherId}`);

    // Filter papers by status
    const approvedPapers = papers.filter(paper => paper.status === 'approved');
    const pendingPapers = papers.filter(paper => paper.status === 'pending');
    const rejectedPapers = papers.filter(paper => 
      paper.status === 'rejected' || 
      paper.status === 'rejected_plagiarism' || 
      paper.status === 'rejected_ai'
    );

    console.log('Paper stats:', {
      total: papers.length,
      approved: approvedPapers.length,
      pending: pendingPapers.length,
      rejected: rejectedPapers.length
    });

    // Calculate earnings from approved papers only
    const totalEarnings = approvedPapers.length * 1; // $1 per approved paper

    // Get or create payment record
    let payment = await Payment.findOne({ researcherId });
    
    if (!payment) {
      payment = new Payment({
        researcherId,
        earnings: {
          totalEarned: totalEarnings,
          availableBalance: totalEarnings,
          totalWithdrawn: 0,
          currency: 'USD'
        },
        paperRewards: [],
        withdrawals: [],
        withdrawalSettings: {
          minimumAmount: 20
        },
        status: 'active'
      });
    }

    // Update paper rewards with REAL data
    payment.paperRewards = papers.map(paper => ({
      paperId: paper._id,
      paperTitle: paper.title,
      submittedAt: paper.createdAt,
      approvedAt: paper.status === 'approved' ? paper.updatedAt : undefined,
      status: paper.status === 'approved' ? 'approved' : 
              (paper.status === 'pending' ? 'pending' : 'rejected'),
      rewardAmount: 1.00,
      rewardPaid: paper.status === 'approved'
    }));

    // Calculate total withdrawn from previous withdrawals
    const totalWithdrawn = payment.withdrawals
      .filter(w => w.status === 'completed')
      .reduce((sum, w) => sum + w.amount, 0);

    // Update earnings
    payment.earnings.totalEarned = totalEarnings;
    payment.earnings.totalWithdrawn = totalWithdrawn;
    payment.earnings.availableBalance = totalEarnings - totalWithdrawn;

    await payment.save();

    console.log('Updated payment record:', {
      totalEarned: payment.earnings.totalEarned,
      availableBalance: payment.earnings.availableBalance,
      totalWithdrawn: payment.earnings.totalWithdrawn
    });

    return NextResponse.json({
      success: true,
      _id: payment._id,
      bankDetails: payment.bankDetails || {},
      earnings: payment.earnings,
      paperRewards: payment.paperRewards,
      withdrawals: payment.withdrawals,
      withdrawalSettings: payment.withdrawalSettings,
      status: payment.status
    });

  } catch (error) {
    console.error('[PAYMENTS API ERROR]', error);
    return NextResponse.json({ 
      error: 'Failed to fetch payment data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { action, researcherId, data } = body;

    if (!researcherId) {
      return NextResponse.json({ error: 'Researcher ID is required' }, { status: 400 });
    }

    const payment = await Payment.findOne({ researcherId });
    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 });
    }

    switch (action) {
      case 'updateBankDetails':
        payment.bankDetails = {
          ...payment.bankDetails,
          ...data
        };
        await payment.save();
        
        return NextResponse.json({
          success: true,
          message: 'Bank details updated successfully',
          bankDetails: payment.bankDetails,
          _id: payment._id,
          earnings: payment.earnings,
          paperRewards: payment.paperRewards,
          withdrawals: payment.withdrawals,
          withdrawalSettings: payment.withdrawalSettings,
          status: payment.status
        });

      case 'withdrawal':
      case 'requestWithdrawal':
        const { amount } = data;
        
        if (amount < payment.withdrawalSettings.minimumAmount) {
          return NextResponse.json({ 
            error: `Minimum withdrawal amount is $${payment.withdrawalSettings.minimumAmount}` 
          }, { status: 400 });
        }

        if (amount > payment.earnings.availableBalance) {
          return NextResponse.json({ 
            error: 'Insufficient balance' 
          }, { status: 400 });
        }

        if (!payment.bankDetails?.accountNumber) {
          return NextResponse.json({ 
            error: 'Bank details required for withdrawal' 
          }, { status: 400 });
        }

        // Process withdrawal
        const withdrawalId = `WD${Date.now()}`;
        
        payment.earnings.availableBalance -= amount;
        payment.earnings.totalWithdrawn += amount;
        
        payment.withdrawals.push({
          id: withdrawalId,
          amount,
          currency: 'USD',
          status: 'completed', // In real app, this would be 'pending' initially
          requestedAt: new Date(),
          processedAt: new Date(),
          bankDetails: {
            accountNumber: payment.bankDetails.accountNumber,
            bankName: payment.bankDetails.bankName || 'Unknown Bank'
          }
        });

        await payment.save();

        return NextResponse.json({
          success: true,
          message: 'Withdrawal processed successfully',
          withdrawalId,
          newBalance: payment.earnings.availableBalance,
          _id: payment._id,
          bankDetails: payment.bankDetails,
          earnings: payment.earnings,
          paperRewards: payment.paperRewards,
          withdrawals: payment.withdrawals,
          withdrawalSettings: payment.withdrawalSettings,
          status: payment.status
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

  } catch (error) {
    console.error('[PAYMENTS POST ERROR]', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}