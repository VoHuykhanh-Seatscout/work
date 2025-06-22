import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const pathname = request.nextUrl.pathname;

  // If user is logged in and tries to access onboarding but already completed it
  if (token && pathname === '/onboarding' && token.onboardingComplete) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is logged in but hasn't completed onboarding (except for onboarding and auth pages)
  if (
    token &&
    !token.onboardingComplete &&
    !pathname.startsWith('/onboarding') &&
    !pathname.startsWith('/auth')
  ) {
    return NextResponse.redirect(new URL('/onboarding', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};