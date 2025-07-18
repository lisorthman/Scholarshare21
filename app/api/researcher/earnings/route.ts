import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import ResearchPaper from '@/models/ResearchPaper';
import Payment from '@/models/payment';
import User from '@/models/user';
import { isValidObjectId } from 'mongoose';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const researcherId = searchParams.get('researcherId');

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

    // Get all papers by this researcher from ResearchPaper model
    const papers = await ResearchPaper.find({ authorId: researcher._id })
      .sort({ createdAt: -1 })
      .lean();

    // Calculate earnings from approved papers
    const approvedPapers = papers.filter(paper => paper.status === 'approved');
    const pendingPapers = papers.filter(paper => 
      paper.status === 'pending' || paper.status === 'passed_checks'
    );
    const rejectedPapers = papers.filter(paper => 
      paper.status === 'rejected' || 
      paper.status === 'rejected_plagiarism' || 
      paper.status === 'rejected_ai'
    );

    const totalEarnings = approvedPapers.length * 1; // $1 per approved paper

    // Get or create payment record
    let paymentRecord = await Payment.findOne({ researcherId: researcher._id.toString() });
    
    if (!paymentRecord) {
      paymentRecord = await Payment.create({
        researcherId: researcher._id.toString(),
        bankDetails: {},
        earnings: {
          totalEarned: totalEarnings,
          availableBalance: totalEarnings,
          totalWithdrawn: 0,
          currency: 'USD'
        },
        paperRewards: papers.map(paper => ({
          paperId: paper._id,
          paperTitle: paper.title,
          submittedAt: paper.createdAt,
          approvedAt: paper.status === 'approved' ? paper.updatedAt : undefined,
          status: paper.status === 'approved' ? 'approved' : 
                 paper.status === 'rejected' || 
                 paper.status === 'rejected_plagiarism' || 
                 paper.status === 'rejected_ai' ? 'rejected' : 'pending',
          rewardAmount: 1,
          rewardPaid: paper.status === 'approved'
        })),
        withdrawals: [],
        withdrawalSettings: {
          minimumAmount: 20
        },
        status: 'active'
      });
    } else {
      // Update existing record with latest data
      const totalWithdrawn = paymentRecord.earnings.totalWithdrawn || 0;
      
      paymentRecord.earnings.totalEarned = totalEarnings;
      paymentRecord.earnings.availableBalance = totalEarnings - totalWithdrawn;
      
      // Sync paper rewards with actual papers
      paymentRecord.paperRewards = papers.map(paper => ({
        paperId: paper._id,
        paperTitle: paper.title,
        submittedAt: paper.createdAt,
        approvedAt: paper.status === 'approved' ? paper.updatedAt : undefined,
        status: paper.status === 'approved' ? 'approved' : 
               paper.status === 'rejected' || 
               paper.status === 'rejected_plagiarism' || 
               paper.status === 'rejected_ai' ? 'rejected' : 'pending',
        rewardAmount: 1,
        rewardPaid: paper.status === 'approved'
      }));
      
      await paymentRecord.save();
    }

    const canWithdraw = paymentRecord.earnings.availableBalance >= 20;

    return NextResponse.json({
      success: true,
      data: {
        researcher: {
          id: researcher._id,
          name: researcher.name,
          email: researcher.email
        },
        totalEarnings: paymentRecord.earnings.totalEarned,
        availableBalance: paymentRecord.earnings.availableBalance,
        totalWithdrawn: paymentRecord.earnings.totalWithdrawn,
        canWithdraw,
        minimumWithdrawal: 20,
        paperRewards: paymentRecord.paperRewards,
        withdrawals: paymentRecord.withdrawals || [],
        bankDetails: paymentRecord.bankDetails || {},
        summary: {
          totalPapers: papers.length,
          approvedPapers: approvedPapers.length,
          pendingPapers: pendingPapers.length,
          rejectedPapers: rejectedPapers.length
        }
      }
    });

  } catch (error) {
    console.error('[EARNINGS API ERROR]', error);
    return NextResponse.json(
      { error: 'Failed to fetch earnings data' },
      { status: 500 }
    );
  }
}