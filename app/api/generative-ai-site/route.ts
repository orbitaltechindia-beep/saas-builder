import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const systemPrompt = `You are an elite front-end developer. 
  Output ONLY a valid JSON array of "Node" objects. No markdown.
  
  Interface Node {
    id: string;
    type: 'Container' | 'Text' | 'Image' | 'Button' | 'Link' | 'Form';
    props: { text?: string; href?: string; styles?: React.CSSProperties };
    children?: Node[];
  }
  
  Rules:
  1. Use modern, premium aesthetics (dark mode, flexbox, grid).
  2. Use inline styles heavily (padding, backgroundColor, color, fontSize, display, justifyContent, alignItems, borderRadius).
  3. Generate unique string IDs.
  4. Create at least a Hero section, a Features section, and a CTA section.`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `Generate a website for: ${prompt}` }
    ]);

    let content = result.response.text();
    content = content.replace(/```json/g, '').replace(/```/g, '').trim();

    const parsedNodes = JSON.parse(content);
    return NextResponse.json({ success: true, nodes: parsedNodes });
  } catch (error: any) {
    console.error("Gemini AI Error:", error);
    return NextResponse.json({ error: "Failed to generate site" }, { status: 500 });
  }
}