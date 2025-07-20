'use server';
import jwt from 'jsonwebtoken';
import { revalidatePath } from 'next/cache';
import PDFParser from 'pdf2json';
import mammoth from 'mammoth';
import connectDB from '@/lib/mongoose';
import ResearchPaper from '@/models/ResearchPaper';
import nodemailer from 'nodemailer';

interface GrammarResult {
  matches: Array<{
    message: string;
    shortMessage: string;
    replacements: Array<{ value: string }>;
    context: { text: string; offset: number; length: number };
    rule: { id: string; description: string; category: { id: string; name: string } };
  }>;
}

export async function checkGrammar(paperId: string, token: string): Promise<{
  success: boolean;
  grammarResult?: GrammarResult;
  error?: string;
}> {
  try {
    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
    if (decoded.role !== 'admin') {
      return { success: false, error: 'Unauthorized: Admin access required' };
    }

    await connectDB();
    const paper = await ResearchPaper.findById(paperId).populate('authorId', 'name email');
    if (!paper) {
      return { success: false, error: 'Paper not found' };
    }

    console.log(`Processing paper: ${paper.title}, fileType: ${paper.fileType}, fileUrl: ${paper.fileUrl}`);

    // Fetch file from Vercel Blob
    const response = await fetch(paper.fileUrl, { cache: 'no-store' });
    if (!response.ok) {
      console.error(`Failed to fetch file: status ${response.status}`);
      return { success: false, error: `Failed to fetch paper file: status ${response.status}` };
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    console.log(`Buffer size: ${buffer.length} bytes`);

    // Extract text
    let text: string;
    if (paper.fileType === 'application/pdf') {
      const pdfParser = new PDFParser(null, true);
      text = await new Promise((resolve, reject) => {
        pdfParser.on('pdfParser_dataError', (errData) => {
          console.error(`PDF parsing error: ${errData.parserError}`);
          reject(new Error(errData.parserError));
        });
        pdfParser.on('pdfParser_dataReady', () => {
          const extractedText = pdfParser.getRawTextContent();
          console.log(`Extracted PDF text length: ${extractedText.length} characters`);
          if (!extractedText.trim()) {
            reject(new Error('No text extracted from PDF'));
          } else {
            resolve(extractedText);
          }
        });
        pdfParser.parseBuffer(buffer);
      });
    } else if (
      paper.fileType === 'application/msword' ||
      paper.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
      console.log(`Extracted DOCX text length: ${text.length} characters`);
      if (!text.trim()) {
        return { success: false, error: 'No text extracted from DOCX' };
      }
    } else {
      return { success: false, error: 'Unsupported file type' };
    }

    console.log(`Extracted text (first 100 chars): ${text.slice(0, 100)}`);

    // Call LanguageTool public API
    const responseLT = await fetch('https://api.languagetool.org/v2/check', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: new URLSearchParams({
        text,
        language: 'en-US',
      }).toString(),
    });

    // Log raw response for debugging
    const rawResponse = await responseLT.text();
    console.log(`LanguageTool API response (status ${responseLT.status}): ${rawResponse.slice(0, 200)}`);

    if (!responseLT.ok) {
      console.error(`LanguageTool API failed: status ${responseLT.status}, response: ${rawResponse.slice(0, 200)}`);
      return { success: false, error: `LanguageTool API failed with status ${responseLT.status}: ${rawResponse.slice(0, 200)}` };
    }

    let grammarResult: GrammarResult;
    try {
      grammarResult = JSON.parse(rawResponse);
    } catch (jsonError: any) {
      console.error(`Failed to parse LanguageTool response: ${jsonError.message}`);
      return { success: false, error: `Invalid API response: ${rawResponse.slice(0, 200)}` };
    }

    const hasCriticalIssues = grammarResult.matches.some(
      (match) => match.rule.category.id === 'GRAMMAR' && match.replacements.length > 0
    );

    // Update paper status
    paper.grammarIssues = grammarResult.matches;
    paper.lastGrammarCheck = new Date();
    paper.updatedAt = new Date();
    paper.status = hasCriticalIssues ? 'rejected' : 'approved';
    if (hasCriticalIssues) {
      paper.rejectionReason = 'Needs more improvement in grammar';
    } else {
      paper.rejectionReason = undefined;
    }
    await paper.save();

    console.log(`Paper updated: status=${paper.status}, grammarIssues=${grammarResult.matches.length}`);

    // Send email notification
    const author = paper.authorId as any;
    const authorEmail = author?.email;
    const authorName = author?.name || 'Researcher';
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: authorEmail,
        subject: `Paper ${hasCriticalIssues ? 'Rejected' : 'Approved'}: ${paper.title}`,
        text: `Dear ${authorName},\n\nYour paper titled "${paper.title}" has been ${
          hasCriticalIssues
            ? 'rejected as it needs more improvement in grammar'
            : 'approved after grammar checking'
        }.\n\n${
          hasCriticalIssues
            ? 'Please revise the grammar issues and resubmit.'
            : 'Congratulations on passing the grammar check.'
        }\n\nNote: Using public LanguageTool API with limited requests. Contact support for issues.\n\nBest regards,\nThe ScholarShare Team`,
        html: `
          <p>Dear ${authorName},</p>
          <p>Your paper titled "<strong>${paper.title}</strong>" has been <strong>${
            hasCriticalIssues ? 'rejected' : 'approved'
          }</strong> after grammar checking.</p>
          <p>${
            hasCriticalIssues
              ? 'It needs more improvement in grammar. Please revise and resubmit.'
              : 'Congratulations on passing the grammar check.'
          }</p>
          <p><em>Note: Using public LanguageTool API with limited requests. Contact support for issues.</em></p>
          <p>Best regards,<br>The ScholarShare Team</p>
        `,
      });
      console.log(`Email sent to ${authorEmail} with subject "Paper ${hasCriticalIssues ? 'Rejected' : 'Approved'}: ${paper.title}"`);
    } catch (emailError: any) {
      console.error(`Failed to send email: ${emailError.message}`);
    }

    // Revalidate the paper-management page
    revalidatePath('/admin-dashboard/paper-management', 'page');

    return { success: true, grammarResult };
  } catch (error: any) {
    console.error('Grammar check error:', {
      message: error.message,
      paperId,
      timestamp: new Date().toISOString(),
    });
    return { success: false, error: error.message };
  }
}