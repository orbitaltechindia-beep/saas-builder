import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { prompt } = await req.json(); // Removed modules to speed up response

  try {
    // Drastically reduced prompt for speed (under 5 seconds response time)
    const systemPrompt = `Output ONLY a JSON array of Node objects.
    Node: { id: string, type: 'Container'|'Text'|'Button', props: { text?: string, styles?: React.CSSProperties }, children?: Node[] }
    Rules: Be fast. Be concise. Generate a dark-mode Hero section and a simple CTA section based on the user's prompt. Use inline styles.`;

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