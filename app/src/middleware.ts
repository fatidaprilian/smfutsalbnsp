import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "__Host-session";

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (secret) {
    return new TextEncoder().encode(secret);
  }
  return new TextEncoder().encode("dev-only-secret-do-not-use-in-production-32ch");
}

const publicPaths = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  let session: { userId: string; role: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecretKey(), {
        algorithms: ["HS256"],
      });
      session = {
        userId: payload.userId as string,
        role: payload.role as string,
      };
    } catch {
      // Invalid token — treat as not logged in
    }
  }

  const isPublicPath =
    pathname === "/" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  // Not logged in → redirect to login (except public paths)
  if (!session && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Logged in → redirect away from login/register
  if (session && isPublicPath) {
    const dest =
      session.role === "ADMIN" ? "/admin/reservations" : "/reservations";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // Route protection: /admin/* requires ADMIN
  if (session && pathname.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/reservations", request.url));
  }

  // Route protection: /reservations requires CUSTOMER
  if (
    session &&
    pathname === "/reservations" &&
    session.role !== "CUSTOMER"
  ) {
    return NextResponse.redirect(new URL("/admin/reservations", request.url));
  }

  // Root redirect
  if (session && pathname === "/") {
    const dest =
      session.role === "ADMIN" ? "/admin/reservations" : "/reservations";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
