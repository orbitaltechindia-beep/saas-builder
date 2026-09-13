import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';
  
  // UPDATE THIS TO YOUR ACTUAL VERCEL URL
  const mainAppDomain = 'orbitalwebsites.vercel.app'; 
  const localhost = 'localhost:3000';

  // If the visitor is on your main SaaS domain or localhost, let them use the app (login, dashboard, etc.)
  if (hostname === mainAppDomain || hostname === localhost || hostname === `www.${mainAppDomain}`) {
    // Handle protected routes
    const token = request.cookies.get('firebase-token')?.value;
    const protectedRoutes = ['/dashboard', '/editor'];
    const isProtected = protectedRoutes.some(route => url.pathname.startsWith(route));

    if (isProtected && !token) {
      // We let the client-side handle the redirect now, so just pass through
    }
    return NextResponse.next();
  }

  // If the visitor is on a client's custom domain or subdomain, rewrite the URL to the public viewer.
  // This makes it so the visitor sees "infinityclasses.vercel.app" in the URL, 
  // but Next.js loads the "app/view/[domain]/page.tsx" component behind the scenes!
  url.pathname = `/view`;
  url.searchParams.set('domain', hostname);
  
  const res = NextResponse.rewrite(url);
  return res;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};