import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  return NextResponse.json({ error: "Role setting is temporarily disabled" }, { status: 501 });
}