import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isPublicStatic =
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname.includes('.');

  // Check demo session cookie
  const demoCookie = request.cookies.get('brandguard_demo_session')?.value;
  let isAuthenticated = false;

  if (demoCookie) {
    try {
      const parsed = JSON.parse(decodeURIComponent(demoCookie));
      if (parsed && parsed.loggedIn && typeof parsed.name === 'string') {
        isAuthenticated = true;
      }
    } catch {
      isAuthenticated = Boolean(demoCookie);
    }
  }

  // Protected routes check
  if (!isAuthenticated && !isAuthRoute && !isApiRoute && !isPublicStatic) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Already authenticated: redirect away from login page to dashboard
  if (isAuthenticated && isAuthRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    return NextResponse.redirect(redirectUrl);
  }

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
