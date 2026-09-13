import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET() {
  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GOOGLE_AI_API_KEY environment variable" }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Call Google's ListModels endpoint
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();

    // Extract just the model names
    const modelNames = data.models.map((m: any) => m.name);

    return NextResponse.json({ models: modelNames });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}