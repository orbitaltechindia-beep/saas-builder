import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// CRITICAL: Tell Vercel to allow up to 60 seconds for this AI request
export const maxDuration = 60;

export async function POST(req: Request) {
  const { prompt, modules } = await req.json();

  try {
    const systemPrompt = `You are an elite front-end developer. Output ONLY a valid JSON array of "Node" objects. No markdown.
    Interface Node { id: string; type: 'Container' | 'Text' | 'Image' | 'Button' | 'Link' | 'Form'; props: { text?: string; href?: string; styles?: React.CSSProperties }; children?: Node[]; }
    Rules: 1. Premium aesthetics. 2. Inline styles. 3. Unique IDs. 4. Include modules: ${modules.join(', ')}.`;

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    // Retry Logic: If Google fails with 503, wait 1 second and try again (up to 3 times)
    const retryGenerate = async (attempt: number): Promise<any> => {
      try {
        const result = await model.generateContent([
          { text: systemPrompt },
          { text: `Institute Info: ${prompt}\n\nGenerate the JSON array.` }
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
    }

    const parsedNodes = JSON.parse(content);

    return NextResponse.json({ success: true, nodes: parsedNodes });
  } catch (error: any) {
    console.error("AI Generation Error Details:", error.message);
    return NextResponse.json({ 
      error: "Failed to generate site", 
      details: error.message 
    }, { status: 500 });
  }
}