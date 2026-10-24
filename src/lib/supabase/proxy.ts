import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isPreviewMode, isSupabaseConfigured } from "@/lib/site";

const PROTECTED = ["/dashboard"];
const AUTH_PAGES = ["/login", "/signup"];

/**
 * Refreshes the Supabase session on every matched request and guards the dashboard.
 * Returns the response that carries any refreshed auth cookies and cache headers.
 */
export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtected = PROTECTED.some((p) => path === p || path.startsWith(`${p}/`));

  if (!isSupabaseConfigured()) {
    // Local review without keys: the dashboard renders sample data. Production stays locked.
    if (isProtected && !isPreviewMode()) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
        // Keep CDNs from caching a response that sets a session cookie.
        Object.entries(headers ?? {}).forEach(([key, value]) => supabaseResponse.headers.set(key, String(value)));
      },
    },
  });

  // Do not run code between createServerClient and getClaims(): it refreshes the token.
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);

  const redirectTo = (pathname: string, keepNext = false) => {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = "";
    if (keepNext) url.searchParams.set("next", path);
    const res = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((c) => res.cookies.set(c));
    ["cache-control", "expires", "pragma"].forEach((h) => {
      const v = supabaseResponse.headers.get(h);
      if (v) res.headers.set(h, v);
    });
    return res;
  };

  if (isProtected && !signedIn) return redirectTo("/login", true);
  if (signedIn && AUTH_PAGES.includes(path)) return redirectTo("/dashboard");

  return supabaseResponse;
}
