import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db } from '@/lib/firebase/client';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export async function POST(req: Request) {
  const { prompt, currentNodes, userId } = await req.json();

  try {
    // 1. Check Quota
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data() || {};

    const lastReset = userData.lastAiReset?.toDate() || new Date(0);
    const today = new Date();
    const isSameDay = lastReset.toDateString() === today.toDateString();

    let websitesUsed = isSameDay ? (userData.aiWebsitesUsed || 0) : 0;
    let followupsUsed = isSameDay ? (userData.aiFollowupsUsed || 0) : 0;
    const followupLimit = userData.aiFollowupLimit || 12; // Default 12

    if (followupsUsed >= followupLimit) {
      return NextResponse.json({ 
        error: `Daily edit limit reached (${followupsUsed}/${followupLimit}). Try again tomorrow.` 
      }, { status: 429 });
    }

    // 2. Edit Site
    const systemPrompt = `You are an elite front-end developer. The user has a JSON array of their current website "Node" objects and wants to modify it. Output ONLY the modified JSON array. No markdown.`;

    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Missing API Key" }, { status: 500 });

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `Current Nodes: \n${JSON.stringify(currentNodes)}\n\nInstruction: ${prompt}` }
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
      aiFollowupsUsed: followupsUsed + 1,
      lastAiReset: today
    });

    return NextResponse.json({ success: true, nodes: parsedNodes });
  } catch (error: any) {
    console.error("AI Edit Error:", error);
    return NextResponse.json({ error: "Failed to edit site", details: error.message }, { status: 500 });
  }
}