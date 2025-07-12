import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import ResearchPaper from '@/models/ResearchPaper';
import User from '@/models/user';
import { ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';

// Interfaces for TypeScript clarity
interface PopulatedAuthor {
  _id: ObjectId;
  name: string;
  email: string;
}

interface PopulatedPaper {
  _id: ObjectId;
  title: string;
  status: string;
  approvedAt?: Date;
  rejectedAt?: Date;
  createdAt?: Date;
  version?: string;
  authorId?: PopulatedAuthor;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    console.log('Received ID:', params.id);
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid paper ID format' },
        { status: 400 }
      );
    }

    const paper = await ResearchPaper.findById(new ObjectId(params.id))
  .populate('authorId', 'name email')
  .lean<PopulatedPaper & { reviews: any[] } | null>();


    if (!paper) {
      return NextResponse.json(
        { success: false, error: 'Paper not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...paper,
        _id: paper._id.toString(),
        authorId: paper.authorId
          ? {
              ...paper.authorId,
              _id: paper.authorId._id.toString()
            }
          : null
      }
    });
  } catch (error) {
    console.error('Error fetching paper:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid paper ID format' },
        { status: 400 }
      );
    }

    const { action, feedback } = await request.json();

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action. Use "approve" or "reject"'
        },
        { status: 400 }
      );
    }

    const paper = await ResearchPaper.findById(new ObjectId(params.id))
      .populate('authorId', 'name email counts')
      .exec();

    if (!paper) {
      return NextResponse.json(
        { success: false, error: 'Paper not found' },
        { status: 404 }
      );
    }

    if (paper.status !== 'pending') {
      return NextResponse.json(
        {
          success: false,
          error: 'Paper status cannot be changed'
        },
        { status: 400 }
      );
    }

    // Email configuration
    let emailStatus = {
      sent: false,
      error: null as string | null
    };

    if (paper.authorId?.email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        const mailOptions = {
          from: `"ScholarShare" <${process.env.EMAIL_USER}>`,
          to: paper.authorId.email,
          subject: `Your paper "${paper.title}" has been ${action}d`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2d3748;">Dear ${paper.authorId.name || 'Researcher'},</h2>
              <p>Your paper <strong>"${paper.title}"</strong> has been ${action}d by the admin.</p>
              ${
                feedback
                  ? `<div style="background: #f7fafc; padding: 1rem; border-radius: 0.5rem; margin: 1rem 0;">
                    <h3 style="color: #4a5568;">Editor's Feedback:</h3>
                    <p>${feedback}</p>
                  </div>`
                  : ''
              }
              <p>Thank you for your contribution.</p>
              <p style="margin-top: 2rem;">Best regards,<br>The ScholarShare Team</p>
            </div>
          `
        };

        const info = await transporter.sendMail(mailOptions);
        emailStatus.sent = true;
        console.log(`Email sent: ${info.response}`);
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        emailStatus.error = (emailError as Error).message;
      }
    }

    // Process action
    let updatedApprovals = 0;
    if (action === 'approve') {
      paper.status = 'approved';
      paper.approvedAt = new Date();
      await paper.save();

      if (paper.authorId) {
        const updatedUser = await User.findByIdAndUpdate(
          paper.authorId._id,
          { $inc: { 'counts.approvals': 1 } },
          { new: true }
        ).select('counts');

        updatedApprovals = updatedUser?.counts?.approvals || 0;
      }
    } else {
      paper.status = 'rejected';
      paper.rejectedAt = new Date();
      await paper.save();
    }

    return NextResponse.json({
      success: true,
      message: `Paper ${action}d successfully`,
      data: {
        paperId: paper._id.toString(),
        newStatus: paper.status,
        authorId: paper.authorId?._id.toString(),
        approvalsCount: updatedApprovals,
        emailStatus
      },
      shouldRefreshMilestones: true
    });
  } catch (error) {
    console.error('Error processing paper action:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
