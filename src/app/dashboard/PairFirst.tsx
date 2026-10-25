import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Aurora } from "@/components/motion/Aurora";
import { BlurText } from "@/components/motion/BlurText";
import { Reveal } from "@/components/motion/Parallax";
import type { Viewer } from "@/lib/session";
import { PairPanel } from "./devices/PairPanel";
import { SignOutButton } from "./SignOutButton";
import s from "./dashboard.module.css";

/*
 * The only screen after sign-in until a phone is paired. Nothing else in the dashboard opens
 * before this step. People still on the waitlist are told to wait for the production release, and
 * can look at the clearly labelled demo meanwhile.
 */
export function PairFirst({ viewer }: { viewer: Viewer }) {
  return (
    <div className={s.shell} style={{ display: "block" }}>
      <Aurora stops={["#4a7ef2", "#e2fc5b", "#8d74f0"]} amplitude={0.9} className={s.gateAurora} />
      <div className={s.gate}>
        <div className={s.gateTop}>
          <Link href="/" aria-label="Grayvalve home">
            <Logo size={19} />
          </Link>
          <div style={{ width: 120 }}>{!viewer.preview && <SignOutButton />}</div>
        </div>

        <div>
          <ol className={s.stepper} aria-label="Setup">
            <li className={s.done}>
              <span>✓</span> Account
            </li>
            <li className={s.now} aria-current="step">
              <span>2</span> Connect your phone
            </li>
            <li>
              <span>3</span> Your dashboard
            </li>
          </ol>
          <BlurText as="h1" className={s.gateTitle} text={`Welcome, ${viewer.name}.\nConnect your phone first.`} trigger="mount" stagger={0.05} />
          <p className={s.gateLede}>
            Your dashboard shows what your Grayvalve phone streams to it, end-to-end encrypted. Pair it once with a single-use code, then
            everything else opens.
          </p>

          <Reveal delay={0.4} className={s.waitNote}>
            <span className={s.lockIcon} aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
            </span>
            <div>
              <strong>Don&apos;t have the app yet?</strong>
              <p>
                If you haven&apos;t downloaded Grayvalve and you&apos;re still on the waitlist, please wait until the production version of the app
                is released. We&apos;ll email you the moment it&apos;s out. Meanwhile, the demo shows how your dashboard will look, with your name
                and illustrative data.
              </p>
              <div className="row wrap gap-12" style={{ marginTop: 14 }}>
                <Link href="/demo" className="btn btn-glass btn-sm">
                  Explore the demo
                </Link>
                <Link href="/waitlist" className="btn btn-ghost btn-sm">
                  Join the waitlist
                </Link>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2} className={`${s.card} ${s.gateCard}`}>
          <span className={s.label}>Pair your phone</span>
          <h2 className="h3" style={{ margin: 0 }}>
            Show a pairing code, then scan it with the app.
          </h2>
          <PairPanel />
        </Reveal>
      </div>
    </div>
  );
}
