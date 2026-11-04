import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/constants";

/**
 * Optimistic redirect only. Real authorization happens on the server in the
 * admin layout and inside every admin Convex function.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();
  if (!request.cookies.get(ADMIN_SESSION_COOKIE)?.value) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
