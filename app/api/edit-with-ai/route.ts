import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Use Edge runtime for 25s timeout
export const runtime = 'edge';

export async function POST(req: Request) {
  const { prompt, currentNodes } = await req.json();

  try {
    const systemPrompt = `You are an elite front-end developer. The user has a JSON array of their current website "Node" objects and wants to modify it. Output ONLY the modified JSON array. No markdown.`;

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    // Updated to the model Google explicitly requested
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    // CRITICAL: Use streaming to prevent Vercel timeout
    const result = await model.generateContentStream([
      { text: systemPrompt },
      { text: `Current Nodes: \n${JSON.stringify(currentNodes)}\n\nInstruction: ${prompt}` }
    ]);

    let content = '';
    for await (const chunk of result.stream) {
      content += chunk.text();
    }
    
    const jsonStart = content.indexOf('[');
    const jsonEnd = content.lastIndexOf(']');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      content = content.substring(jsonStart, jsonEnd + 1);
    } else {
      return NextResponse.json({ success: false, error: "AI did not return a valid JSON array." }, { status: 500 });
    }

    let parsedNodes;
    try {
      parsedNodes = JSON.parse(content);
    } catch (parseError: any) {
      return NextResponse.json({ success: false, error: "Failed to parse AI JSON." }, { status: 500 });
    }

    return NextResponse.json({ success: true, nodes: parsedNodes });
  } catch (error: any) {
    console.error("AI Edit Error Details:", error.message);
    return NextResponse.json({ error: "Failed to edit site", details: error.message }, { status: 500 });
  }
}