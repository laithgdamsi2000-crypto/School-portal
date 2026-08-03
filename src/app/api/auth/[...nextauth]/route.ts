import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// This is the only file needed to expose NextAuth's endpoints
// (/api/auth/signin, /api/auth/callback, /api/auth/session, etc).
// All actual logic lives in lib/auth.ts — this file just wires it in.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
