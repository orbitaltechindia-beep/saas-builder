import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  const { prompt, currentNodes } = await req.json();

  const systemPrompt = `You are an elite front-end developer and AI assistant inside a website editor.
  The user has provided a JSON array of their current website "Node" objects, and a prompt asking you to modify it.
  
  You must output ONLY the modified JSON array of "Node" objects. No markdown, no explanations.
  
  Interface Node {
    id: string;
    type: 'Container' | 'Text' | 'Image' | 'Button' | 'Link' | 'Form' | 'Video' | 'Divider' | 'Spacer' | 'Icon';
    props: { text?: string; href?: string; src?: string; styles?: React.CSSProperties };
    children?: Node[];
  }
  
  Rules:
  1. Keep existing IDs where possible, but generate unique string IDs for any NEW elements you add.
  2. Use modern, premium aesthetics (dark mode, flexbox, grid).
  3. Use inline styles heavily (padding, backgroundColor, color, fontSize, display, justifyContent, alignItems, borderRadius).
  4. If the user asks to make something longer, add more sections or elements.
  5. If the user asks to change a color, find the relevant elements and change their backgroundColor or color.`;

  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `Current Nodes JSON: \n${JSON.stringify(currentNodes)}\n\nUser Instruction: ${prompt}` }
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
    console.error("AI Edit Error:", error);
    return NextResponse.json({ error: "Failed to edit site", details: error.message }, { status: 500 });
  }
}