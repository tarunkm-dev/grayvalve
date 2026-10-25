"use client";

import { useEffect, useState } from "react";
import { NanoChat } from "@/components/nano/NanoChat";
import { demoDays } from "@/lib/demo-data";
import { AnalyticsCards } from "../dashboard/insights/AnalyticsViews";
import { BodyCards, MindCards, OverviewCards } from "../dashboard/synced/SyncedViews";

/*
 * The demo pages use exactly the dashboard's own cards, fed with demo days built in the browser
 * for the viewer's own date (after mount, so the server's time zone never shows through).
 */

function useDemoDays() {
  const [days, setDays] = useState<ReturnType<typeof demoDays> | null>(null);
  useEffect(() => setDays(demoDays(new Date())), []);
  return days;
}

export function DemoOverview() {
  const days = useDemoDays();
  return days && <OverviewCards days={days} base="/demo" />;
}

export function DemoBody() {
  const days = useDemoDays();
  return days && <BodyCards days={days} demo />;
}

export function DemoMind() {
  const days = useDemoDays();
  return days && <MindCards days={days} />;
}

export function DemoAnalytics() {
  const days = useDemoDays();
  return days && <AnalyticsCards days={days} />;
}

export function DemoNano() {
  return <NanoChat days={useDemoDays() ?? []} demo />;
}
