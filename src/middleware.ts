import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname = url.hostname.toLowerCase();
  const origin = `${url.protocol}//${url.host}`;

  // Extract subdomain (e.g., login.matriz.social or register.matriz.social)
  const isRegisterSubdomain = hostname.startsWith('register.');
  const isLoginSubdomain = hostname.startsWith('login.');

  if (isRegisterSubdomain && url.pathname === '/login') {
    const loginHost = hostname.replace(/^register\./, 'login.');
    return NextResponse.redirect(`${url.protocol}//${loginHost}${url.port ? `:${url.port}` : ''}/`);
  }

  if (isLoginSubdomain && url.pathname === '/register') {
    const registerHost = hostname.replace(/^login\./, 'register.');
    return NextResponse.redirect(`${url.protocol}//${registerHost}${url.port ? `:${url.port}` : ''}/`);
  }

  if (isRegisterSubdomain && url.pathname === '/') {
    return NextResponse.rewrite(new URL('/register', origin));
  }

  if (isLoginSubdomain && url.pathname === '/') {
    return NextResponse.rewrite(new URL('/login', origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
