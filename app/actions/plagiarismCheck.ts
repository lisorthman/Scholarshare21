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

async function extractTextFromPDF(url: string): Promise<string> {
  try {
    console.log(`Fetching PDF from: ${url}`);
    const response = await fetchWithRetry(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF from Vercel Blob: ${response.statusText}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    console.log(`PDF buffer size: ${buffer.length} bytes`);

    const pdfParser = new PDFParser(null, 1); // Verbosity level 1 for debugging
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
  } catch (error: any) {
    console.error("PDF text extraction failed:", error.message);
    throw new Error(`PDF text extraction failed: ${error.message}`);
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

    // Fetch paper by ID
    const paper = await ResearchPaper.findById(paperId);
    if (!paper) {
      throw new Error("Paper not found");
    }
    console.log(`Paper found: ${paper.title}, fileUrl: ${paper.fileUrl}`);

    // Fetch and extract text from Vercel Blob
    const text = await extractTextFromPDF(paper.fileUrl);

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
    console.log(`Paper updated: plagiarismScore=${result.result.score}, status=${newStatus}`);

    // Revalidate the plagiarism check page
    revalidatePath("/admin-dashboard/plagulation-check", "page");

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