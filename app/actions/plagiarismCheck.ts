"use server"; // Mark as Server Action

import { revalidatePath } from "next/cache";
import PDFParser from "pdf2json";
import mammoth from "mammoth";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import connectDB from "@/lib/mongoose";
import ResearchPaper from "@/models/ResearchPaper";
import User from "@/models/user";

interface WinstonAPIResponse {
  result: { score: number };
  sources: Array<{ url: string; text: string }>;
  scanInformation: { scanTime: string };
  credits_used: number;
  credits_remaining: number;
  message?: string;
}

interface PlagiarismCheckResult {
  success: boolean;
  plagiarismScore?: number;
  creditsRemaining?: number;
  error?: string;
  status?: "passed" | "failed";
  rejectionReason?: string;
}

async function fetchWithRetry(url: string, options: RequestInit, retries = 3, backoff = 1000): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(url, options);
    if (response.status === 429) {
      console.log(`Rate limit hit for ${url}, retrying in ${backoff * 2 ** i}ms`);
      await new Promise((resolve) => setTimeout(resolve, backoff * 2 ** i));
      continue;
    }
    return response;
  }
  throw new Error("Max retries reached");
}

async function extractTextFromFile(url: string, fileType: string): Promise<string> {
  try {
    console.log(`Fetching file from: ${url}`);
    const response = await fetchWithRetry(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to fetch file from Vercel Blob: ${response.statusText}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    console.log(`File buffer size: ${buffer.length} bytes`);

    if (fileType === 'application/pdf') {
      const pdfParser = new PDFParser(null, 1);
      return new Promise((resolve, reject) => {
        pdfParser.on("pdfParser_dataError", (errData) => {
          console.error("PDF parsing error:", errData.parserError);
          reject(new Error(`PDF parsing failed: ${errData.parserError}`));
        });
        pdfParser.on("pdfParser_dataReady", () => {
          const text = pdfParser.getRawTextContent();
          console.log(`Extracted text length: ${text.length} characters`);
          if (!text.trim()) {
            reject(new Error("No text extracted from PDF"));
          } else {
            resolve(text);
          }
        });
        pdfParser.parseBuffer(buffer);
      });
    } else if (
      fileType === 'application/msword' ||
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value;
      console.log(`Extracted text length from DOCX: ${text.length} characters`);
      if (!text.trim()) {
        throw new Error("No text extracted from DOCX");
      }
      return text;
    } else {
      throw new Error("Unsupported file type: Only PDF and DOCX files are supported");
    }
  } catch (error: any) {
    console.error("File text extraction failed:", error.message);
    throw new Error(`File text extraction failed: ${error.message}`);
  }
}

export async function checkPlagiarism(paperId: string, token: string): Promise<PlagiarismCheckResult> {
  try {
    // Validate token
    if (!token) {
      throw new Error("No token provided");
    }
    console.log(`Validating token for paperId: ${paperId}`);
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    if (decodedToken.role !== "admin") {
      throw new Error("Unauthorized: Admin access required");
    }

    // Validate paperId
    if (!paperId.match(/^[0-9a-fA-F]{24}$/)) {
      throw new Error("Invalid paper ID");
    }

    // Connect to MongoDB
    await connectDB();
    console.log(`Connected to MongoDB, fetching paper: ${paperId}`);

    // Fetch paper and author
    const paper = await ResearchPaper.findById(paperId).populate('authorId', 'email name');
    if (!paper) {
      throw new Error("Paper not found");
    }
    console.log(`Paper found: ${paper.title}, fileUrl: ${paper.fileUrl}, fileType: ${paper.fileType}`);

    const author = paper.authorId as any;
    const authorEmail = author?.email;
    const authorName = author?.name || "Researcher";
    if (!authorEmail) {
      throw new Error("Author email not found");
    }

    // Fetch and extract text from file
    const text = await extractTextFromFile(paper.fileUrl, paper.fileType);

    // Call Winston AI Plagiarism API
    console.log("Sending text to Winston AI API...");
    const response = await fetchWithRetry("https://api.gowinston.ai/v2/plagiarism", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WINSTON_AI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        language: "en",
        country: "us",
      }),
      cache: "no-store",
    });

    const result: WinstonAPIResponse = await response.json();
    console.log(`Winston AI response: ${JSON.stringify(result, null, 2)}`);
    if (!response.ok) {
      throw new Error(result.message || "Plagiarism check failed");
    }

    // Validate plagiarism response
    if (typeof result.result.score !== "number") {
      throw new Error("Invalid plagiarism check response");
    }

    // Determine status
    const plagiarismThreshold = 20;
    if (result.result.score > plagiarismThreshold) {
      // Send email for failed paper
      console.log("Configuring email transporter for Gmail");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      console.log(`Sending plagiarism failure email to: ${authorEmail}`);
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: authorEmail,
        subject: `Paper Rejected: ${paper.title}`,
        text: `Dear ${authorName},\n\nYour paper titled "${paper.title}" has been rejected as it failed plagiarism checking with a score of ${result.result.score}%.\n\nBest regards,\nThe ScholarShare Team`,
        html: `
          <p>Dear ${authorName},</p>
          <p>Your paper titled "<strong>${paper.title}</strong>" has been rejected as it failed plagiarism checking with a score of <strong>${result.result.score}%</strong>.</p>
          <p>Best regards,<br>The ScholarShare Team</p>
        `,
      });
      console.log(`Email sent to ${authorEmail} with subject "Paper Rejected: ${paper.title}"`);

      // Update status to rejected
      paper.status = "rejected";
      paper.plagiarismScore = result.result.score;
      paper.rejectionReason = `Your paper is rejected due to failing in plagiarism test (${result.result.score}%)`;
      paper.updatedAt = new Date();
      await paper.save();
      console.log(`Paper updated: plagiarismScore=${result.result.score}, status=rejected`);

      // Delete file from Vercel Blob
      if (paper.blobKey || paper.fileUrl) {
        try {
          await del(paper.fileUrl, { token: process.env.BLOB_READ_WRITE_TOKEN });
          console.log(`Deleted file from Vercel Blob: ${paper.fileUrl}`);
        } catch (blobError: any) {
          console.error(`Failed to delete file from Vercel Blob: ${blobError.message}`);
        }
      }

      // Delete the paper
      await ResearchPaper.findByIdAndDelete(paperId);
      console.log(`Paper deleted: ${paperId}`);

      // Revalidate the plagiarism check page
      revalidatePath("/admin-dashboard/plagiarism-check", "page");

      return {
        success: true,
        plagiarismScore: result.result.score,
        creditsRemaining: result.credits_remaining,
        status: "failed",
        rejectionReason: `Your paper is rejected due to failing in plagiarism test (${result.result.score}%)`,
      };
    } else {
      // Update paper for passed checks
      paper.plagiarismScore = result.result.score;
      paper.status = "passed_checks";
      paper.rejectionReason = undefined;
      paper.updatedAt = new Date();
      await paper.save();
      console.log(`Paper updated: plagiarismScore=${result.result.score}, status=passed_checks`);

      // Revalidate the plagiarism check page
      revalidatePath("/admin-dashboard/plagiarism-check", "page");

      return {
        success: true,
        plagiarismScore: result.result.score,
        creditsRemaining: result.credits_remaining,
        status: "passed",
      };
    }
  } catch (error: any) {
    console.error("Plagiarism check error:", {
      message: error.message,
      paperId,
      timestamp: new Date().toISOString(),
    });
    return {
      success: false,
      error: error.message,
    };
  }
}