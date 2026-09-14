import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  const { prompt, currentNodes } = await req.json();

   try {
    const systemPrompt = `You are an elite front-end developer. The user has a JSON array of their current website "Node" objects and wants to modify it. Output ONLY the modified JSON array. No markdown.`;

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
      // If no array brackets found, try to parse as object and wrap in array
      try {
        const parsedObj = JSON.parse(content);
        if (parsedObj.nodes && Array.isArray(parsedObj.nodes)) {
          content = JSON.stringify(parsedObj.nodes);
        }
      } catch (e) {
        // Ignore, just try to parse the original content
      }
    }

    const parsedNodes = JSON.parse(content);

    return NextResponse.json({ success: true, nodes: parsedNodes });
  } catch (error: any) {
    console.error("AI Edit Error Details:", error.message);
    return NextResponse.json({ error: "Failed to edit site", details: error.message }, { status: 500 });
  }
}