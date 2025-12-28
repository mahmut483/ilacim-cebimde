import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login", "/register", "/"];

export function middleware(request: NextRequest) {
  const session = request.cookies.get("ilac_session")?.value;
  const { pathname } = request.nextUrl;

  // 1. If user is accessing a PUBLIC route
  if (publicRoutes.includes(pathname)) {
    // If user is already logged in and tries to access login/register, redirect to dashboard
    if (session && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/yonetim", request.url));
    }
    return NextResponse.next();
  }

  // 2. If user is accessing a PROTECTED route (anything else, e.g. /yonetim)
  if (!session) {
    // Redirect to login if no session
    return NextResponse.redirect(new URL("/login", request.url));
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
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
