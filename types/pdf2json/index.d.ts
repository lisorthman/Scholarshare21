
"use server"; // Mark as Server Action

import { revalidatePath } from "next/cache";
import PDFParser from "pdf2json";
import jwt from "jsonwebtoken";
import connectDB from "@/lib/mongoose";
import ResearchPaper from "@/models/ResearchPaper";

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
}

async function extractTextFromPDF(url: string): Promise<string> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF from Vercel Blob: ${response.statusText}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());

    const pdfParser = new PDFParser();
    return new Promise((resolve, reject) => {
      pdfParser.on("pdfParser_dataError", (errData) => {
        reject(new Error(`PDF parsing failed: ${errData.parserError}`));
      });
      pdfParser.on("pdfParser_dataReady", () => {
        const text = pdfParser.getRawTextContent();
        if (!text.trim()) {
          reject(new Error("No text extracted from PDF"));
        } else {
          resolve(text);
        }
      });
      pdfParser.parseBuffer(buffer);
    });
  } catch (error: any) {
    throw new Error(`PDF text extraction failed: ${error.message}`);
  }
}

export async function checkPlagiarism(paperId: string, token: string): Promise<PlagiarismCheckResult> {
  try {
    // Validate token
    if (!token) {
      throw new Error("No token provided");
    }
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

    // Fetch paper by ID
    const paper = await ResearchPaper.findById(paperId);
    if (!paper) {
      throw new Error("Paper not found");
    }

    // Fetch and extract text from Vercel Blob
    const text = await extractTextFromPDF(paper.fileUrl);

    // Call Winston AI Plagiarism API
    const response = await fetch("https://api.gowinston.ai/v2/plagiarism", {
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
    if (!response.ok) {
      throw new Error(result.message || "Plagiarism check failed");
    }

    // Validate plagiarism response
    if (typeof result.result.score !== "number") {
      throw new Error("Invalid plagiarism check response");
    }

    // Determine status based on plagiarism score
    const plagiarismThreshold = 20;
    const newStatus = result.result.score > plagiarismThreshold ? "rejected_plagiarism" : "passed_checks";
    const rejectionReason = result.result.score > plagiarismThreshold 
      ? `Your paper is rejected due to failing in plagiarism test (${result.result.score}%)` 
      : undefined;

    // Update paper with results
    paper.plagiarismScore = result.result.score;
    paper.status = newStatus;
    paper.rejectionReason = rejectionReason;
    paper.updatedAt = new Date();
    await paper.save();

    // Revalidate the plagiarism check page
    revalidatePath("/admin-dashboard/plagiarism-check", "page");

    return {
      success: true,
      plagiarismScore: result.result.score,
      creditsRemaining: result.credits_remaining,
    };
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