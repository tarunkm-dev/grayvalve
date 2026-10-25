"use client";

import Link from "next/link";
import { useActionState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { joinWaitlist } from "@/app/(site)/waitlist/actions";
import s from "./WaitlistForm.module.css";

/** Name + email sign-up for the production release. One answer for new and known emails. */
export function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [state, action, pending] = useActionState(joinWaitlist, {});

  return (
    <div className={`${s.wrap} ${compact ? s.compact : ""}`}>
      <AnimatePresence mode="wait" initial={false}>
        {state.ok ? (
          <motion.div
            key="done"
            className={s.done}
            role="status"
            initial={{ opacity: 0, scale: 0.96, filter: "blur(6px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.5 }}
          >
            <svg className={s.check} width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
              <circle cx="28" cy="28" r="26" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
              <motion.path
                d="M17 29l7 7 15-16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              />
            </svg>
            <div>
              <strong>You&apos;re on the list.</strong>
              <p>
                We&apos;ll email you the moment the production version of Grayvalve is released. Until then, sign in to explore a demo dashboard
                with your name on it.
              </p>
              <Link href="/signup" className="btn btn-glass btn-sm" style={{ marginTop: 14 }}>
                Create an account for the demo
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.form key="form" action={action} className={s.form} exit={{ opacity: 0, y: -8 }}>
            <div className={s.fields}>
              <label className={s.field}>
                <span>Your name</span>
                <input name="name" type="text" autoComplete="given-name" maxLength={80} placeholder="First name" className="input" />
              </label>
              <label className={s.field}>
                <span>Email</span>
                <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="input" />
              </label>
            </div>
            <fieldset className={s.platform}>
              <legend className="sr-only">Your phone</legend>
              <label>
                <input type="radio" name="platform" value="android" defaultChecked />
                <span>Android</span>
              </label>
              <label>
                <input type="radio" name="platform" value="ios" />
                <span>iPhone</span>
              </label>
            </fieldset>
            {/* Hidden from people; bots fill it in. */}
            <input name="company" tabIndex={-1} autoComplete="off" className={s.trap} aria-hidden="true" />
            {state.error && (
              <p className="notice error" role="alert" style={{ margin: 0 }}>
                {state.error}
              </p>
            )}
            <button type="submit" className={`btn btn-primary ${s.submit}`} disabled={pending}>
              {pending ? "Adding you…" : "Join the waitlist"}
              {!pending && (
                <span className="chevrons" aria-hidden="true">
                  <span>›</span>
                  <span>›</span>
                  <span>›</span>
                </span>
              )}
            </button>
            <p className={s.fine}>One email when it&apos;s ready. No newsletter, no tracking, and you can ask us to remove you any time.</p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
