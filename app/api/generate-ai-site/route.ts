import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  const { prompt, modules } = await req.json();

  const systemPrompt = `You are an elite front-end developer and AI assistant inside a website builder.
  Output ONLY a valid JSON array of "Node" objects for the HOME PAGE. No markdown.
  
  Interface Node {
    id: string;
    type: 'Container' | 'Text' | 'Image' | 'Button' | 'Link' | 'Form' | 'Video' | 'Divider' | 'Spacer' | 'Icon';
    props: { text?: string; href?: string; src?: string; styles?: React.CSSProperties };
    children?: Node[];
  }
  
  Rules:
  1. Use modern, premium aesthetics (dark mode, flexbox, grid).
  2. Use inline styles heavily (padding, backgroundColor, color, fontSize, display, justifyContent, alignItems, borderRadius).
  3. Generate unique string IDs.
  4. The user has requested the following modules: ${modules.join(', ')}.
  5. ONLY include sections for the requested modules. Do NOT include modules that were not selected.
  6. Always include a Hero section and a Footer.`;

  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `Institute Info: ${prompt}\n\nGenerate the JSON array for the home page.` }
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
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Failed to generate site", details: error.message }, { status: 500 });
  }
}