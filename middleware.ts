import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  // 1. Skip middleware for API Auth routes (IMPORTANT)
  if (nextUrl.pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  const isLoginPage = nextUrl.pathname.startsWith('/login');
  const isApiRoute = nextUrl.pathname.startsWith('/api');

  if (isApiRoute) {
    if (isLoggedIn) return NextResponse.next();
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  if (isLoginPage) {
    if (isLoggedIn) return Response.redirect(new URL('/', nextUrl));
    return NextResponse.next();
  }

  if (!isLoggedIn) {
    return Response.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Use a more precise negative lookahead
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};