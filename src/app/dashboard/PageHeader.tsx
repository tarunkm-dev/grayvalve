"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import s from "./dashboard.module.css";

function greetingFor(hour: number) {
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/** Greeting and date use the viewer's own clock, so they're filled in after hydration. */
export function PageHeader({ title, name, sample = true }: { title?: string; name?: string; sample?: boolean }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const date = now ? now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }) : " ";
  const heading = title ?? `${now ? greetingFor(now.getHours()) : "Welcome back"}, ${name}.`;

  return (
    <header className={s.header}>
      <div>
        <span className={s.date}>{date}</span>
        <h1 className={s.greeting}>{heading}</h1>
      </div>
      <div className={s.headerActions}>
        {sample && (
          <span className="chip concept" title="Pair your phone to replace sample data with your own">
            Sample data
          </span>
        )}
        <Link href="/dashboard/devices" className="btn btn-primary btn-sm">
          Pair a device
        </Link>
      </div>
    </header>
  );
}
