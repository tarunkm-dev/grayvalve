import Link from "next/link";
import { site } from "@/lib/site";

export function AndroidIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M17.6 9.48l1.84-3.18a.38.38 0 00-.66-.38l-1.86 3.22A11.5 11.5 0 0012 8.1c-1.77 0-3.43.39-4.92 1.04L5.22 5.92a.38.38 0 00-.66.38L6.4 9.48A10.78 10.78 0 001 18h22a10.78 10.78 0 00-5.4-8.52zM7 15.25a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zm10 0a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5z" />
    </svg>
  );
}

/**
 * Primary download action. Points at NEXT_PUBLIC_ANDROID_DOWNLOAD_URL when it is set; until the
 * store listing exists it leads to the download page, which explains how to join the beta.
 */
export function DownloadButton({ label = "Download for Android", size }: { label?: string; size?: "sm" }) {
  const cls = `btn btn-primary ${size === "sm" ? "btn-sm" : ""}`;
  const inner = (
    <>
      <AndroidIcon size={size === "sm" ? 16 : 20} />
      {label}
    </>
  );
  if (site.androidDownloadUrl) {
    return (
      <a href={site.androidDownloadUrl} className={cls} rel="noopener">
        {inner}
      </a>
    );
  }
  return (
    <Link href="/download" className={cls}>
      {inner}
    </Link>
  );
}
