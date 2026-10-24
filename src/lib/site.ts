export const site = {
  name: "Grayvalve",
  tagline: "Your day, intelligently tuned.",
  description:
    "Grayvalve reads how you slept, asks how you're arriving, and builds a realistic day around your rhythm. Private, on-device intelligence for body and mind, and the foundation for Grayvalve's future health devices.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  androidDownloadUrl: process.env.NEXT_PUBLIC_ANDROID_DOWNLOAD_URL || "",
  minAndroid: "Android 11 or newer",
};

export const navLinks = [
  { href: "/#product", label: "Product" },
  { href: "/features", label: "Features" },
  { href: "/#privacy", label: "Privacy" },
  { href: "/roadmap", label: "Roadmap" },
  { href: "/download", label: "Download" },
];

/** True when the Supabase project keys are present. */
export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

/**
 * Without Supabase keys, local development can still open the dashboard with sample data so the
 * interface can be reviewed. Production never does this.
 */
export function isPreviewMode() {
  return !isSupabaseConfigured() && process.env.NODE_ENV !== "production";
}
