import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { domain } = await req.json();

  if (!domain) {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 });
  }

  try {
    // 1. Automatically add the domain to your Vercel Project via Vercel API
    const vercelRes = await fetch(`https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: domain })
    });

    const vercelData = await vercelRes.json();

    // If Vercel says it's already added, that's fine! We just proceed.
    if (!vercelRes.ok && vercelData.error?.code !== 'domain_already_in_use') {
      throw new Error(vercelData.error?.message || 'Vercel API failed to add domain');
    }

    return NextResponse.json({ success: true, message: `Domain ${domain} provisioned on Vercel!` });
  } catch (error: any) {
    console.error("Provisioning Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}