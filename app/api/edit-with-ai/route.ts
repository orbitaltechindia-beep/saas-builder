import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// CRITICAL: Tell Vercel to allow up to 60 seconds for this AI request
export const maxDuration = 60;

export async function POST(req: Request) {
  const { prompt, currentNodes } = await req.json();

  try {
    const systemPrompt = `You are an elite front-end developer. The user has a JSON array of their current website "Node" objects and wants to modify it. Output ONLY the modified JSON array. No markdown.`;

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    // Retry Logic: If Google fails with 503, wait 1 second and try again (up to 3 times)
    const retryGenerate = async (attempt: number): Promise<any> => {
      try {
        const result = await model.generateContent([
          { text: systemPrompt },
          { text: `Current Nodes: \n${JSON.stringify(currentNodes)}\n\nInstruction: ${prompt}` }
        ]);
        return result.response.text();
      } catch (err: any) {
        if (attempt < 3 && (err?.status === 503 || err?.status === 500 || err?.message?.includes('503'))) {
          console.log(`Attempt ${attempt} failed with 503. Retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 sec
          return retryGenerate(attempt + 1);
        }
        throw err;
      }
    };

    let content = await retryGenerate(1);
    
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
      return NextResponse.json({ 
        success: false, 
        error: "Failed to parse AI JSON.",
        details: "The AI returned malformed JSON."
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, nodes: parsedNodes });
  } catch (error: any) {
    console.error("AI Edit Error Details:", error.message);
    return NextResponse.json({ error: "Failed to edit site", details: error.message }, { status: 500 });
  }
}