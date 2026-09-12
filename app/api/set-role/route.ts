import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

// This route allows you to make yourself a Superadmin
export async function POST(req: Request) {
  const { uid } = await req.json();
  try {
    await adminAuth.setCustomUserClaims(uid, { role: 'superadmin' });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}