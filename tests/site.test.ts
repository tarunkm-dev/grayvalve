import { describe, expect, it } from "vitest";
import { cleanSupabaseUrl, cleanUrl } from "@/lib/site";

describe("environment clean-up", () => {
  it("trims whitespace, line breaks and trailing slashes from URLs", () => {
    expect(cleanUrl("  https://grayvalve.vercel.app/ \n")).toBe("https://grayvalve.vercel.app");
    expect(cleanUrl("https://grayvalve.vercel.app///")).toBe("https://grayvalve.vercel.app");
    expect(cleanUrl(undefined)).toBe("");
  });

  it("accepts a pasted REST or Auth endpoint as the Supabase URL", () => {
    expect(cleanSupabaseUrl("https://abc.supabase.co/rest/v1/")).toBe("https://abc.supabase.co");
    expect(cleanSupabaseUrl("https://abc.supabase.co/auth/v1")).toBe("https://abc.supabase.co");
    expect(cleanSupabaseUrl("https://abc.supabase.co\n")).toBe("https://abc.supabase.co");
  });
});
