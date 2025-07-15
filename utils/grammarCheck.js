// utils/grammarCheck.js
import axios from 'axios';

export async function checkGrammar(text) {
  try {
    const response = await axios.post(process.env.LANGTOOL_API_URL, {
      text,
      language: 'en-US',
    }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    const issues = response.data.matches.map((match) => match.message);
    const score = Math.max(0, 100 - issues.length * 5); // Simple score: -5 per issue
    return { issues, score };
  } catch (error) {
    console.error('Grammar check failed:', error.message);
    return { issues: [], score: null };
  }
}