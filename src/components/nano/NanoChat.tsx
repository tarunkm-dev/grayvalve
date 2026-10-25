"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { DayMetrics } from "@/lib/sync-crypto";
import { NANO_SYSTEM, contextSummary, fallbackAnswer } from "@/lib/nano";
import s from "./NanoChat.module.css";

/*
 * Nano intelligence: the dashboard assistant, on Gemini Nano through Chrome's built-in Prompt API.
 * The model runs on this computer, so questions and summaries never leave the browser. Where the
 * API isn't available it answers with built-in guidance and says so. The conversation lives in
 * memory only and is gone when the panel closes or the page is left.
 */

type Availability = "unavailable" | "downloadable" | "downloading" | "available";
type LMSession = {
  promptStreaming(input: string, opts?: { signal?: AbortSignal }): ReadableStream<string>;
  destroy(): void;
};
type LMStatic = {
  availability(opts?: object): Promise<Availability>;
  create(opts: {
    initialPrompts?: { role: "system" | "user" | "assistant"; content: string }[];
    signal?: AbortSignal;
    monitor?: (m: EventTarget) => void;
  }): Promise<LMSession>;
};

function api(): LMStatic | null {
  const g = globalThis as unknown as { LanguageModel?: LMStatic };
  return g.LanguageModel ?? null;
}

type Msg = { from: "you" | "nano"; text: string; local?: boolean };

const STARTERS = ["Points to improve my health", "Plan my meals for a training day", "Help me sleep better", "Review my month"];

export function NanoChat({ days, demo = false }: { days: DayMetrics[]; demo?: boolean }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Availability | "checking">("checking");
  const [progress, setProgress] = useState<number | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const session = useRef<LMSession | null>(null);
  const abort = useRef<AbortController | null>(null);
  const log = useRef<HTMLDivElement>(null);
  const daysRef = useRef(days);
  daysRef.current = days;

  useEffect(() => {
    if (!open) return;
    const lm = api();
    if (!lm) {
      setStatus("unavailable");
      return;
    }
    lm.availability()
      .then(setStatus)
      .catch(() => setStatus("unavailable"));
  }, [open]);

  // Closing the panel ends the model session and forgets the conversation.
  const close = useCallback(() => {
    abort.current?.abort();
    session.current?.destroy();
    session.current = null;
    setMsgs([]);
    setOpen(false);
  }, []);

  useEffect(() => () => {
    abort.current?.abort();
    session.current?.destroy();
  }, []);

  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const ensureSession = async (): Promise<LMSession | null> => {
    if (session.current) return session.current;
    const lm = api();
    if (!lm || (status !== "available" && status !== "downloadable" && status !== "downloading")) return null;
    const system = `${NANO_SYSTEM}\n\n${contextSummary(daysRef.current)}${demo ? "\n(These are demo numbers, not the person's real data.)" : ""}`;
    session.current = await lm.create({
      initialPrompts: [{ role: "system", content: system }],
      monitor(m) {
        m.addEventListener("downloadprogress", (e) => {
          const loaded = (e as Event & { loaded?: number }).loaded ?? 0;
          setProgress(loaded);
          if (loaded >= 1) setProgress(null);
        });
      },
    });
    setStatus("available");
    return session.current;
  };

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy) return;
    setInput("");
    setBusy(true);
    setMsgs((m) => [...m, { from: "you", text: q }]);
    try {
      const sess = await ensureSession().catch(() => {
        // The model couldn't start here (no space, blocked download): use built-in guidance from now on.
        setStatus("unavailable");
        return null;
      });
      if (!sess) {
        await new Promise((r) => setTimeout(r, 450));
        setMsgs((m) => [...m, { from: "nano", text: fallbackAnswer(q, daysRef.current), local: true }]);
        return;
      }
      abort.current = new AbortController();
      setMsgs((m) => [...m, { from: "nano", text: "" }]);
      const stream = sess.promptStreaming(q, { signal: abort.current.signal });
      const reader = stream.getReader();
      let text = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        // Older Chrome builds stream the whole answer so far; newer ones stream only the new part.
        text = value.startsWith(text) ? value : text + value;
        setMsgs((m) => [...m.slice(0, -1), { from: "nano", text }]);
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        setMsgs((m) => [...m.filter((x) => x.text !== ""), { from: "nano", text: fallbackAnswer(q, daysRef.current), local: true }]);
      }
    } finally {
      setBusy(false);
    }
  };

  const statusText =
    status === "checking"
      ? "Checking for Gemini Nano…"
      : status === "available"
        ? "Gemini Nano · on this device"
        : status === "downloadable" || status === "downloading"
          ? progress !== null
            ? `Downloading Gemini Nano · ${Math.round(progress * 100)}%`
            : "Gemini Nano downloads on first question"
          : "Built-in guidance · Gemini Nano isn't available in this browser";

  return (
    <>
      <motion.button
        type="button"
        className={s.fab}
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls="nano-panel"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        <span className={s.orb} aria-hidden="true" />
        <span>{open ? "Close" : "Ask Nano"}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.section
            id="nano-panel"
            role="dialog"
            aria-label="Nano intelligence"
            className={s.panel}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <header className={s.head}>
              <span className={s.orb} aria-hidden="true" />
              <div className={s.headText}>
                <strong>Nano intelligence</strong>
                <span>{statusText}</span>
              </div>
              <button type="button" className={s.x} onClick={close} aria-label="Close Nano intelligence">
                ×
              </button>
            </header>

            <div className={s.log} ref={log} aria-live="polite">
              {msgs.length === 0 && (
                <div className={s.intro}>
                  <p>
                    Ask about improving your health, meal preparation, sleep, stress or your trends. {demo ? "I'm using the demo numbers on this page." : "I can see the summaries your phone is streaming to this tab."}
                  </p>
                  <p className={s.private}>Runs in this browser. Nothing you type is sent to Grayvalve or stored.</p>
                  <div className={s.starters}>
                    {STARTERS.map((t) => (
                      <button key={t} type="button" onClick={() => ask(t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {msgs.map((m, i) => (
                <motion.div
                  key={i}
                  className={`${s.msg} ${m.from === "you" ? s.you : s.nano}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {m.text || (
                    <span className={s.typing} aria-label="Nano is thinking">
                      <i />
                      <i />
                      <i />
                    </span>
                  )}
                  {m.local && <em className={s.local}>Built-in guidance</em>}
                </motion.div>
              ))}
              {busy && msgs[msgs.length - 1]?.from === "you" && (
                <div className={`${s.msg} ${s.nano}`}>
                  <span className={s.typing} aria-label="Nano is thinking">
                    <i />
                    <i />
                    <i />
                  </span>
                </div>
              )}
            </div>

            <form
              className={s.form}
              onSubmit={(e) => {
                e.preventDefault();
                void ask(input);
              }}
            >
              <input
                className={s.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about sleep, meals, training…"
                aria-label="Ask Nano intelligence"
                maxLength={600}
                autoComplete="off"
              />
              <button type="submit" className={s.send} disabled={busy || !input.trim()} aria-label="Send">
                ↑
              </button>
            </form>
            <p className={s.fine}>Wellbeing guidance, not medical advice.</p>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
