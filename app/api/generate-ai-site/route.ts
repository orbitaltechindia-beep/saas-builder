import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  const { prompt, features } = await req.json();

  // Build dynamic instructions based on toggles
  let featureInstructions = "Include sections for: Hero, Trust Strip, CTA. ";
  if (features?.courses) featureInstructions += "Include a Courses section. ";
  if (features?.centres) featureInstructions += "Include a Centres/Locations section. ";
  if (features?.results) featureInstructions += "Include a Results section. ";
  if (features?.testimonials) featureInstructions += "Include a Testimonials section. ";
  if (features?.blog) featureInstructions += "Include a Blog section. ";
  if (features?.tests) featureInstructions += "Include a Free Resources/Tests section. ";
  if (features?.notifications) featureInstructions += "Include a Notification sign-up section. ";

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
  2. Use inline styles heavily.
  3. Generate unique string IDs.
  4. ${featureInstructions}`;

  try {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `Generate a website for: ${prompt}` }
    ]);

    let content = result.response.text();
    
    // Safely extract just the JSON array [ ... ]
    const jsonStart = content.indexOf('[');
    const jsonEnd = content.lastIndexOf(']');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      content = content.substring(jsonStart, jsonEnd + 1);
    }

    const parsedNodes = JSON.parse(content);
    return NextResponse.json({ success: true, nodes: parsedNodes });
  } catch (error: any) {
    console.error("Gemini AI Error:", error);
    return NextResponse.json({ 
      error: "Failed to generate site", 
      details: error.message || "Unknown error" 
    }, { status: 500 });
  }
}