import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 runs `proxy.ts` (formerly `middleware.ts`) before matched routes.
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Only routes that read the session: the dashboard, auth pages and auth handlers.
  matcher: ["/dashboard/:path*", "/login", "/signup", "/auth/:path*"],
};
