import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // REPLACE 'your-actual-vercel-app.vercel.app' WITH YOUR REAL VERCEL URL
  const mainAppDomains = ['localhost:3000', 'orbitalwebsites.vercel.app']; 
  
  if (mainAppDomains.includes(hostname)) {
    return NextResponse.next();
  }

  // Route client domains to the public viewer
  url.pathname = `/view`;
  url.searchParams.set('domain', hostname);
  
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};