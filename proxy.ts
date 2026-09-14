import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // REPLACE 'saas-builder-dun.vercel.app' WITH YOUR ACTUAL MAIN VERCEL URL!
  const mainAppDomains = ['localhost:3000', 'saas-builder-dun.vercel.app']; 
  
  // If the visitor is on your main SaaS domain, let them use the app normally
  if (mainAppDomains.includes(hostname)) {
    return NextResponse.next();
  }

  // If the visitor is on a client's custom domain...
  // 1. Extract the path (e.g., '/', '/about-us')
  const path = url.pathname;
  const pageSlug = path === '/' ? 'home' : path.substring(1).replace(/\//g, '');

  // 2. Silently rewrite the URL to load the public viewer, passing the domain AND the page slug
  url.pathname = `/view`;
  url.searchParams.set('domain', hostname);
  url.searchParams.set('page', pageSlug);
  
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};