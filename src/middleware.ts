import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = request.headers.get('host') || '';

  // Extract subdomain (e.g., login.matriz.social or register.matriz.social)
  const isRegisterSubdomain = hostname.startsWith('register.');
  const isLoginSubdomain = hostname.startsWith('login.');

  if (isRegisterSubdomain && url.pathname === '/') {
    return NextResponse.rewrite(new URL('/register', request.url));
  }

  if (isLoginSubdomain && url.pathname === '/') {
    return NextResponse.rewrite(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
