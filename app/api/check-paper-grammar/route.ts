import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Paper from '@/models/paper';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf'; // Use legacy build
import mammoth from 'mammoth';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Configure PDF.js worker path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const localWorkerPath = join(__dirname, '../../node_modules/pdfjs-dist/build/pdf.worker.min.js'); // Updated to correct path

interface GrammarIssue {
  message: string;
  type: string;
}

interface PaperDocument extends mongoose.Document {
  rejectionDetails?: {
    grammarIssues?: string[];
  };
}

export async function POST(req: Request) {
  try {
    const { paperId, fileUrl } = await req.json();
    console.log('Received raw paperId:', paperId, 'fileUrl:', fileUrl);

    // Set worker src to local path
    try {
      const fs = await import('fs/promises');
      await fs.access(localWorkerPath);
      pdfjsLib.GlobalWorkerOptions.workerSrc = localWorkerPath;
      console.log('Using local worker path:', localWorkerPath);
    } catch (error) {
      throw new Error('Local worker not found: ' + error.message);
    }

    // Validate inputs
    if (!fileUrl || !fileUrl.startsWith('https://')) {
      return NextResponse.json(
        { message: 'Invalid or missing file URL' },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');

    // Try to find paper if ID provided
    let paper: PaperDocument | null = null;
    if (paperId?.trim()?.length === 24) {
      try {
        paper = await Paper.findById(paperId);
        if (!paper) {
          paper = await Paper.findOne({ _id: paperId }); // Fallback
        }
      } catch (dbError) {
        console.error('Database lookup error:', dbError);
      }
    }

    // Fetch the file
    console.log('Fetching file from URL:', fileUrl);
    const fileResponse = await axios.get(fileUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
    });
    
    const fileBuffer = Buffer.from(fileResponse.data);
    console.log(`Received file with size: ${fileBuffer.length} bytes`);

    // Size limit check
    if (fileBuffer.length > 10 * 1024 * 1024) {
      return NextResponse.json(
        { message: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Extract text based on file type
    let text = '';
    const fileExtension = fileUrl.split('.').pop()?.toLowerCase();

    try {
      if (fileExtension === 'pdf') {
        console.log('Processing PDF file');
        const uint8Array = new Uint8Array(fileBuffer);
        const loadingTask = pdfjsLib.getDocument(uint8Array);
        const pdf = await loadingTask.promise;
        
        const maxPages = Math.min(pdf.numPages, 20); // Limit to 20 pages
        console.log(`Extracting text from ${maxPages} pages`);
        
        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          text += textContent.items.map((item: any) => item.str).join(' ') + '\n';
        }
      } 
      else if (fileExtension === 'doc' || fileExtension === 'docx') {
        console.log('Processing Word document');
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        text = result.value;
      } 
      else {
        return NextResponse.json(
          { message: 'Unsupported file type' },
          { status: 400 }
        );
      }
    } catch (extractionError) {
      console.error('Text extraction failed:', extractionError);
      return NextResponse.json(
        { 
          message: `Error processing ${fileExtension} file`,
          details: extractionError.message 
        },
        { status: 400 }
      );
    }

    // Validate extracted text
    const textToCheck = text.substring(0, 20000).trim();
    if (!textToCheck) {
      return NextResponse.json(
        { message: 'No text extracted from file' },
        { status: 400 }
      );
    }

    // Grammar check with LanguageTool
    console.log('Sending text to LanguageTool');
    const ltResponse = await axios.post(
      process.env.LANGTOOL_API_URL!,
      new URLSearchParams({
        text: textToCheck,
        language: 'en-US',
        enabledOnly: 'true',
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15000,
      }
    );

    // Process grammar issues
    const issues: GrammarIssue[] = ltResponse.data.matches.map(
      (match: { message: string; rule: { issueType: string } }) => ({
        message: match.message,
        type: match.rule.issueType,
      })
    );

    // Calculate score
    const errorCount = issues.length;
    const criticalIssues = issues.filter((issue) => 
      ['grammar', 'misspelling'].includes(issue.type)
    ).length;
    const score = Math.max(0, 100 - errorCount * 2 - criticalIssues * 5);

    // Update paper if exists
    if (paper) {
      paper.rejectionDetails = {
        ...paper.rejectionDetails,
        grammarIssues: issues.map(issue => issue.message),
      };
      await paper.save();
      console.log('Updated paper with grammar issues');
    }

    return NextResponse.json(
      {
        issues: issues.map(issue => issue.message),
        issueDetails: issues,
        score,
        errorCount,
        criticalIssues,
        textSample: textToCheck.substring(0, 500) + '...',
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Grammar check failed:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data,
    });

    if (error.response?.status === 429) {
      return NextResponse.json(
        { message: 'LanguageTool rate limit exceeded. Try again later.' },
        { status: 429 }
      );
    }

    if (error.message.includes('PDF')) {
      return NextResponse.json(
        { message: 'Error processing PDF file', details: error.message },
        { status: 400 }
      );
    }

    if (error.message.includes('mammoth')) {
      return NextResponse.json(
        { message: 'Error processing Word document', details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        message: 'Server error during grammar check',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined 
      },
      { status: 500 }
    );
  } finally {
    await mongoose.disconnect().catch(err => console.error('MongoDB disconnect error:', err));
  }
}

export const GET = () => NextResponse.json(
  { message: 'Method not allowed' },
  { status: 405 }
);

export const PUT = () => NextResponse.json(
  { message: 'Method not allowed' },
  { status: 405 }
);

export const DELETE = () => NextResponse.json(
  { message: 'Method not allowed' },
  { status: 405 }
);