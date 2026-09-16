import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Use Edge runtime for 25s timeout
export const runtime = 'edge';

export async function POST(req: Request) {
  const { prompt, modules } = await req.json();

  try {
    const systemPrompt = `You are an elite front-end developer. Output ONLY a valid JSON array of "Node" objects. No markdown.
    Interface Node { id: string; type: 'Container' | 'Text' | 'Image' | 'Button' | 'Link' | 'Form'; props: { text?: string; href?: string; styles?: React.CSSProperties }; children?: Node[]; }
    Rules: 1. Premium aesthetics. 2. Inline styles. 3. Unique IDs. 4. Include modules: ${modules.join(', ')}.`;

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    // Updated to the model Google explicitly requested
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    // CRITICAL: Use generateContentStream to keep connection alive and bypass Vercel timeout
    const result = await model.generateContentStream([
      { text: systemPrompt },
      { text: `Institute Info: ${prompt}\n\nGenerate the JSON array.` }
    ]);

    let content = '';
    for await (const chunk of result.stream) {
      content += chunk.text();
    }

    const jsonStart = content.indexOf('[');
    const jsonEnd = content.lastIndexOf(']');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      content = content.substring(jsonStart, jsonEnd + 1);
    }

    const parsedNodes = JSON.parse(content);
    return NextResponse.json({ success: true, nodes: parsedNodes });
  } catch (error: any) {
    console.error("AI Generation Error Details:", error.message);
    return NextResponse.json({ error: "Failed to generate site", details: error.message }, { status: 500 });
  }
}