import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login');

  // Entrance login page removed: redirect any /login visits directly to /dashboard
  if (isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

  // All routes are accessible directly with no login barrier
  return NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
