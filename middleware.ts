import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isApiAuthRoute = nextUrl.pathname.startsWith('/api/auth');
  const isLoginPage = nextUrl.pathname.startsWith('/login');
  const isApiRoute = nextUrl.pathname.startsWith('/api');

  // Allow NextAuth specific API routes
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Protect other API routes
  if (isApiRoute) {
    if (isLoggedIn) {
      return NextResponse.next();
    }
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // Handle login page
  if (isLoginPage) {
    if (isLoggedIn) {
      // Redirect to home if already logged in
      return Response.redirect(new URL('/', nextUrl));
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!isLoggedIn) {
    return Response.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\.png$).*)'],
};

