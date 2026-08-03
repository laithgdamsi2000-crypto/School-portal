import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * Runs on every request to a matched path, server-side, before any page
 * or API handler executes. This is the real security boundary — a client
 * component that "hides" the dashboard if unauthenticated is NOT
 * sufficient on its own, since the underlying route would still respond
 * to a direct request.
 */
export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        // Always allow the login page itself through unauthenticated —
        // otherwise this creates a redirect loop: blocked here -> redirect
        // to /admin/login -> blocked here again -> forever.
        if (req.nextUrl.pathname === "/admin/login") return true;

        // /admin/* pages: always require an admin session.
        if (req.nextUrl.pathname.startsWith("/admin")) {
          return !!token && (token as any).role === "admin";
        }

        // API routes shared between public browsing (GET) and admin
        // management (POST/PATCH/DELETE): only mutating methods require auth.
        // GET requests fall through unauthenticated so parents/students
        // can browse homework, announcements, and files with no login.
        if (req.method === "GET") return true;

        return !!token && (token as any).role === "admin";
      },
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*", // includes /admin/login — now safely allowed inside the callback above
    "/api/homework/:path*",
    "/api/announcements/:path*",
    "/api/files/:path*",
    "/api/grades/:path*",
    "/api/subjects/:path*",
    "/api/teachers/:path*",
    "/api/admin/:path*",
    "/api/admins/:path*",
    "/api/settings/:path*",
  ],
};
