import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  const { prompt, modules, userId } = await req.json();

  try {
    // 1. Check Quota
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() || {};

    // Reset if it's a new day
    const lastReset = userData.lastAiReset?.toDate() || new Date(0);
    const today = new Date();
    const isSameDay = lastReset.toDateString() === today.toDateString();

    let websitesUsed = isSameDay ? (userData.aiWebsitesUsed || 0) : 0;
    let followupsUsed = isSameDay ? (userData.aiFollowupsUsed || 0) : 0;
    const websiteLimit = userData.aiWebsiteLimit || 3; // Default 3

    if (websitesUsed >= websiteLimit) {
      return NextResponse.json({ 
        error: `Daily limit reached (${websitesUsed}/${websiteLimit}). Try again tomorrow or request more from Superadmin.` 
      }, { status: 429 });
    }

    // 2. Generate Site
    const systemPrompt = `You are an elite front-end developer. Output ONLY a valid JSON array of "Node" objects. No markdown.
    Interface Node { id: string; type: 'Container' | 'Text' | 'Image' | 'Button' | 'Link' | 'Form'; props: { text?: string; href?: string; styles?: React.CSSProperties }; children?: Node[]; }
    Rules: 1. Premium aesthetics. 2. Inline styles. 3. Unique IDs. 4. Include modules: ${modules.join(', ')}.`;

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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

    // 3. Increment Quota
    await updateDoc(userRef, {
      aiWebsitesUsed: websitesUsed + 1,
      lastAiReset: today,
      followupIncreaseRequest: null // Clear any pending requests if they generate successfully
    });

    return NextResponse.json({ success: true, nodes: parsedNodes });
  } catch (error: any) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Failed to generate site", details: error.message }, { status: 500 });
  }
}