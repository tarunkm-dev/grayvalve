"use client";

import { useActionState } from "react";
import { updateProfile } from "./actions";

export function ProfileForm({ name, email, preview }: { name: string; email: string; preview: boolean }) {
  const [state, action, pending] = useActionState(updateProfile, {});
  return (
    <form action={action} className="stack gap-16">
      <div className="field">
        <label htmlFor="display_name">Display name</label>
        <input id="display_name" name="display_name" className="input" defaultValue={name} maxLength={80} />
      </div>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" className="input" value={email} readOnly aria-readonly="true" style={{ color: "var(--faint)" }} />
      </div>
      {state.error && (
        <p className="notice error" role="alert">
          {state.error}
        </p>
      )}
      {state.message && (
        <p className="notice ok" role="status">
          {state.message}
        </p>
      )}
      <div>
        <button className="btn btn-primary btn-sm" type="submit" disabled={pending || preview}>
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
