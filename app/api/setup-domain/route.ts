import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { domain } = await req.json();

  if (!domain) {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 });
  }

  try {
    // 1. Try to add the domain to your Vercel Project
    const vercelRes = await fetch(`https://api.vercel.com/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VERCEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: domain })
    });

    const vercelData = await vercelRes.json();

    // 2. If successful, we are good!
    if (vercelRes.ok) {
      return NextResponse.json({ success: true, message: `Domain ${domain} provisioned on Vercel!` });
    }

    // 3. If Vercel says it's ALREADY in your project, that's fine! We can still map it.
    if (vercelData.error?.code === 'domain_already_in_use') {
      return NextResponse.json({ 
        success: true, 
        message: `Domain was already in your Vercel project. Database mapped successfully.` 
      });
    }

    // 4. CRITICAL: If Vercel says it's taken by someone else, return an error to the Superadmin.
    if (vercelData.error?.code === 'domain_not_available' || vercelData.error?.code === 'forbidden') {
      return NextResponse.json({ 
        success: false, 
        error: "This domain is already taken by another Vercel user. The client must choose a different name." 
      }, { status: 400 });
    }

    // 5. Any other unknown Vercel error
    return NextResponse.json({ 
      success: false, 
      error: vercelData.error?.message || 'Failed to provision domain on Vercel.' 
    }, { status: 400 });

  } catch (error: any) {
    console.error("Provisioning Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}