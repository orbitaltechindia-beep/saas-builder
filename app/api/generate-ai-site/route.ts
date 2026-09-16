import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// CRITICAL: Use Edge Runtime for 25s timeout instead of 10s
export const runtime = 'edge';

export async function POST(req: Request) {
  const { prompt, modules } = await req.json();

  try {
       const systemPrompt = `You are an elite front-end developer. Output ONLY a JSON array of "Node" objects.
    Node: { id: string, type: 'Container'|'Text'|'Button'|'Image', props: { text?: string, styles?: React.CSSProperties }, children?: Node[] }
    Rules: 1. Be concise. 2. Use inline styles. 3. Generate sections: ${modules.join(', ')}. Do NOT add explanations.`;
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `Institute Info: ${prompt}\n\nGenerate the JSON array.` }
    ]);

    let content = result.response.text();

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