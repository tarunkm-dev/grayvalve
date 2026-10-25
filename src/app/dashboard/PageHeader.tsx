"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BlurText } from "@/components/motion/BlurText";
import s from "./dashboard.module.css";

function greetingFor(hour: number) {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Greeting and date use the viewer's own clock, so they're filled in after hydration. */
export function PageHeader({ title, name, mode = "live" }: { title?: string; name?: string; mode?: "live" | "demo" | "plain" }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const date = now ? now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }) : " ";
  const heading = title ?? `${now ? greetingFor(now.getHours()) : "Welcome back"}, ${name}.`;

  return (
    <header className={s.header}>
      <div>
        <span className={s.date}>{date}</span>
        <BlurText key={heading} as="h1" className={s.greeting} text={heading} trigger="mount" stagger={0.05} />
      </div>
      <div className={s.headerActions}>
        {mode === "demo" && (
          <>
            <span className="chip concept" title="Illustrative numbers. Pair your phone to see your own.">
              Demo data
            </span>
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              Pair your phone
            </Link>
          </>
        )}
        {mode === "live" && (
          <span className="chip signal">
            <span className="pulse-dot" aria-hidden="true" /> End-to-end encrypted
          </span>
        )}
      </div>
    </header>
  );
}
