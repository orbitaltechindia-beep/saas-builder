import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  // We are temporarily disabling the server-side redirect 
  // because our Auth is happening on the client side.
  // The dashboard component itself will handle the redirect if the user is not logged in.
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/editor/:path*'],
};