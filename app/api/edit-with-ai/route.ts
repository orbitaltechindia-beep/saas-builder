import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  const { prompt, currentNodes } = await req.json();

  try {
    const systemPrompt = `You are an elite front-end developer. The user has a JSON array of their current website "Node" objects and wants to modify it. Output ONLY the modified JSON array. No markdown, no explanations.`;

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `Current Nodes: \n${JSON.stringify(currentNodes)}\n\nInstruction: ${prompt}` }
    ]);

    let content = result.response.text();
    
    // Bulletproof JSON extraction
    const jsonStart = content.indexOf('[');
    const jsonEnd = content.lastIndexOf(']');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      content = content.substring(jsonStart, jsonEnd + 1);
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "AI did not return a valid JSON array.",
        details: "The AI response did not contain a starting '[' or ending ']'."
      }, { status: 500 });
    }

    let parsedNodes;
    try {
      parsedNodes = JSON.parse(content);
    } catch (parseError: any) {
      console.error("JSON Parse Error in AI Edit. Raw content:", content);
      return NextResponse.json({ 
        success: false, 
        error: "Failed to parse AI JSON.",
        details: "The AI returned malformed JSON that could not be parsed."
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, nodes: parsedNodes });
  } catch (error: any) {
    console.error("AI Edit Error Details:", error.message);
    return NextResponse.json({ error: "Failed to edit site", details: error.message }, { status: 500 });
  }
}