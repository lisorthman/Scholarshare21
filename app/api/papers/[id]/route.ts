import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import ResearchPaper from '@/models/ResearchPaper';
import { ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Connecting to the database...');
    await connectDB();
    console.log('Database connected successfully.');

    console.log('Received ID:', params.id);
    if (!ObjectId.isValid(params.id)) {
      console.error('Invalid paper ID:', params.id);
      return NextResponse.json({ error: 'Invalid paper ID' }, { status: 400 });
    }

    const paper = await ResearchPaper.findById(new ObjectId(params.id))
      .populate('authorId', 'name email')
      .exec();

    console.log('Fetched paper:', paper);

    if (!paper) {
      console.error('Paper not found for ID:', params.id);
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    const paperObject = paper.toObject();
    return NextResponse.json(paperObject);
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching paper:', {
        message: error.message,
        stack: error.stack,
        paramsId: params.id,
      });
    } else {
      console.error('Unknown error fetching paper:', { error, paramsId: params.id });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Connecting to the database...');
    await connectDB();
    console.log('Database connected successfully.');

    console.log('Received ID:', params.id);
    if (!ObjectId.isValid(params.id)) {
      console.error('Invalid paper ID:', params.id);
      return NextResponse.json({ error: 'Invalid paper ID' }, { status: 400 });
    }

    const { action } = await request.json();
    console.log('Received action:', action);

    if (!['approve', 'reject'].includes(action)) {
      console.error('Invalid action:', action);
      return NextResponse.json(
        { error: 'Invalid action. Use "approve" or "reject"' },
        { status: 400 }
      );
    }

    const paper = await ResearchPaper.findById(new ObjectId(params.id))
      .populate('authorId', 'name email')
      .exec();
    console.log('Fetched paper for update:', paper);

    if (!paper) {
      console.error('Paper not found for ID:', params.id);
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    if (paper.status !== 'pending') {
      console.error('Paper status cannot be changed:', paper.status);
      return NextResponse.json(
        { error: 'Paper status cannot be changed' },
        { status: 400 }
      );
    }

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Prepare email content (only if authorId is populated)
    let emailSent = false;
    if (paper.authorId && paper.authorId.email) {
      const emailContent = {
        from: process.env.EMAIL_USER,
        to: paper.authorId.email,
        subject: `PDF Submission Update: ${paper.title}`,
        text: `Dear ${paper.authorId.name || 'Researcher'},\n\nYour PDF "${paper.title}" has been ${action}ed by the admin.\n\nBest regards,\nThe ScholarShare Team`,
      };

      // Send email but don't fail the request if it fails
      try {
        await transporter.sendMail(emailContent);
        console.log(`${action} email sent to:`, paper.authorId.email);
        emailSent = true;
      } catch (emailError) {
        console.error('Failed to send email:', {
          message: emailError.message,
          stack: emailError.stack,
          email: paper.authorId.email,
        });
      }
    } else {
      console.warn('Author email not found for paper:', params.id);
    }

    // Update or delete paper based on action
    if (action === 'approve') {
      paper.status = 'approved';
      await paper.save();
      console.log('Paper approved:', paper);
    } else if (action === 'reject') {
      await paper.deleteOne();
      console.log('Paper rejected and deleted:', params.id);
    }

    return NextResponse.json({
      message: 'Action completed successfully',
      emailSent,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error processing action:', {
        message: error.message,
        stack: error.stack,
        paramsId: params.id,
      });
      return NextResponse.json(
        { error: 'Server error', details: error.message },
        { status: 500 }
      );
    } else {
      console.error('Unknown error processing action:', { error, paramsId: params.id });
      return NextResponse.json(
        { error: 'Server error', details: 'Unknown error' },
        { status: 500 }
      );
    }
  }
}