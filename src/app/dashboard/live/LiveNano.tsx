"use client";

import { NanoChat } from "@/components/nano/NanoChat";
import { useLive } from "./LiveProvider";

/** Nano intelligence over whatever the live view is showing right now (nothing until it's live). */
export function LiveNano() {
  const { state } = useLive();
  return <NanoChat days={state.phase === "live" ? state.update.days : []} />;
}
