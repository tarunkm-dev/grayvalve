"use client";

import { useLive } from "./live/LiveProvider";

/** Signing out ends any live view first, so its keys and summaries leave this tab with the session. */
export function SignOutButton() {
  const { stop } = useLive();
  return (
    <form
      action="/auth/signout"
      method="post"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        await stop();
        form.submit();
      }}
    >
      <button type="submit" className="btn btn-ghost btn-sm" style={{ width: "100%" }}>
        Sign out
      </button>
    </form>
  );
}
