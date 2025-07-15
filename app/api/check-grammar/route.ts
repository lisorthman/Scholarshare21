import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ message: 'Text is required' }, { status: 400 });
    }

    // Limit text to 20KB per LanguageTool API constraint
    const textToCheck = text.substring(0, 20000);
    const response = await axios.post(process.env.LANGTOOL_API_URL!, {
      text: textToCheck,
      language: 'en-US',
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const issues = response.data.matches.map((match: { message: string }) => match.message);
    const score = Math.max(0, 100 - issues.length * 5); // Simple score: -5 per issue

    return NextResponse.json({ issues, score }, { status: 200 });
  } catch (error) {
    console.error('Grammar check failed:', error);
    return NextResponse.json({ message: 'Server error', error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

// Restrict to POST method
export const GET = () => NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
export const PUT = () => NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
export const DELETE = () => NextResponse.json({ message: 'Method not allowed' }, { status: 405 });