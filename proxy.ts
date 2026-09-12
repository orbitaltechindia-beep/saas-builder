import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
 // const token = request.cookies.get('firebase-token')?.value;
  
  // Protect Dashboard and Editor
 // if (!token && (request.nextUrl.pathname.startsWith('/dashboard') || 
   //              request.nextUrl.pathname.startsWith('/editor'))) {
  //  return NextResponse.redirect(new URL('/login', request.url));
//  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/editor/:path*', '/superadmin/:path*'],
};