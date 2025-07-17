import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import connectDB from "@/lib/mongoose";
import ResearchPaper from "@/models/ResearchPaper";
import PDFParser from "pdf2json";

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  const pdfParser = new PDFParser(null, 1); // Verbosity level 1 for debugging
  return new Promise((resolve, reject) => {
    pdfParser.on("pdfParser_dataError", (errData) => {
      console.error("PDF parsing error:", errData.parserError);
      reject(new Error(`PDF parsing failed: ${errData.parserError}`));
    });
    pdfParser.on("pdfParser_dataReady", () => {
      const text = pdfParser.getRawTextContent();
      console.log(`Extracted text length: ${text.length} characters`);
      resolve(text);
    });
    pdfParser.parseBuffer(buffer);
  });
}

export async function POST(request: Request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const authorId = formData.get("authorId") as string;
    const category = formData.get("category") as string;
    const categoryId = formData.get("categoryId") as string;

    // Upload to Vercel Blob
    console.log(`Uploading file: ${file.name}`);
    const blob = await put(`papers/${file.name}`, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    console.log(`Uploaded to Vercel Blob: ${blob.url}`);

    // Verify text extraction
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromPDF(buffer);
    if (!text.trim()) {
      throw new Error("No text extracted from PDF");
    }

    // Save to MongoDB
    const paper = new ResearchPaper({
      title,
      fileUrl: blob.url,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      authorId,
      status: "pending",
      category,
      categoryId,
      keywords: [],
      views: 0,
      downloads: 0,
      viewedBy: [],
      downloadedBy: [],
      downloadCount: 0,
      viewCount: 0,
      rejectionDetails: null,
      readerStats: {},
      reviews: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await paper.save();
    console.log(`Paper saved: ${paper._id}`);

    return NextResponse.json({ success: true, paperId: paper._id }, { status: 200 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}