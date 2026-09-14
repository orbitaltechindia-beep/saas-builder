import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // 🔴 REPLACE 'saas-builder-dun.vercel.app' WITH YOUR ACTUAL VERCEL URL!
  const mainAppDomain = 'orbitalwebsites.vercel.app'; 
  
  // Check if the visitor is on localhost OR your exact main domain (with or without www.)
  const isMainApp = hostname === 'localhost:3000' || hostname === mainAppDomain || hostname === `www.${mainAppDomain}`;

  // If the visitor is on your main SaaS domain, let them use the app normally
  if (isMainApp) {
    return NextResponse.next();
  }

  // If the visitor is on a client's custom domain...
  const path = url.pathname;
  const pageSlug = path === '/' ? 'home' : path.substring(1).replace(/\//g, '');

  url.pathname = `/view`;
  url.searchParams.set('domain', hostname);
  url.searchParams.set('page', pageSlug);
  
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};