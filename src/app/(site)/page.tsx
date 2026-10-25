import Image from "next/image";
import Link from "next/link";
import { DotMatrix } from "@/components/DotMatrix";
import { RunnerMark } from "@/components/Logo";
import { WaitlistForm } from "@/components/WaitlistForm";
import { FeatureExplorer } from "@/components/home/FeatureExplorer";
import { Hero } from "@/components/home/Hero";
import { DayStory, type Chapter } from "@/components/home/DayStory";
import { NanoShowcase } from "@/components/home/NanoShowcase";
import { BodyAtlas } from "@/components/body/BodyAtlas";
import { BreathOrb } from "@/components/body/BreathOrb";
import { Bars, RangeBand, SleepStages, WaveLine } from "@/components/charts";
import { BlurText } from "@/components/motion/BlurText";
import { CountUp } from "@/components/motion/CountUp";
import { GsapParallax } from "@/components/motion/GsapParallax";
import { Reveal, TiltIn } from "@/components/motion/Parallax";
import { ScrollWords } from "@/components/motion/ScrollWords";
import { deviceConcepts, featureGroups, horizons, securityPoints } from "@/lib/content";
import { mindPractices, organs } from "@/lib/body-content";
import { sample } from "@/lib/sample-data";
import s from "./home.module.css";

const chapters: Chapter[] = [
  {
    time: "06:48",
    kicker: "The night, read",
    title: "Before your alarm, it already knows how you slept.",
    body: "Grayvalve reads last night from Health Connect: how long, how deep, how often you woke. It compares it with your own baseline, never a stranger's.",
    screen: "body-trends",
    aura: "var(--lavender)",
    stat: { label: "Sleep", value: "6h 50m · 2 wake-ups" },
  },
  {
    time: "07:02",
    kicker: "Arrive honestly",
    title: "Thirty seconds to say how you're really arriving.",
    body: "Mood, energy, stress and sleep, with a word for every value. Choose 'not sure' and it stays unknown. Grayvalve never guesses on your behalf.",
    screen: "checkin",
    aura: "var(--magenta)",
    stat: { label: "Check-in", value: "Mood 4 · Energy 3 · Stress 2" },
  },
  {
    time: "07:05",
    kicker: "One next move",
    title: "Your day, rebuilt around the body you woke up in.",
    body: "Readiness, labelled Estimated, with the inputs it used and the ones it didn't. Then one clear, realistic action and a reason you can check.",
    screen: "today",
    aura: "var(--ember)",
    stat: { label: "Readiness", value: "72 / 100 · medium confidence" },
  },
  {
    time: "10:30",
    kicker: "Gray, on your phone",
    title: "An assistant that proposes. You decide.",
    body: "Gray runs on Gemini Nano on the phone itself. It plans a quieter walking route, starts a focus block or logs a habit, and you approve, decline or undo every action.",
    screen: "gray",
    aura: "var(--violet)",
    stat: { label: "Runs", value: "On device · no cloud" },
  },
  {
    time: "13:30",
    kicker: "Focus and move",
    title: "Deep work that survives interruptions.",
    body: "A focus timer that comes back paused when life gets in the way, and logs only what you finished. A walk after lunch lights up the moment it fits.",
    screen: "focus",
    aura: "var(--ocean)",
    stat: { label: "Focus", value: "75 of 120 min" },
  },
  {
    time: "18:40",
    kicker: "The body, explained",
    title: "Every signal with its source and its freshness.",
    body: "Fifteen signals and twelve organ guides show how your heart, lungs and brain are doing against your usual range, and what helps each one.",
    screen: "body",
    aura: "var(--jade)",
    stat: { label: "HRV", value: "62 ms · inside your range" },
  },
  {
    time: "22:10",
    kicker: "Wind down",
    title: "A night that's worth keeping.",
    body: "Non-sleep deep rest or a sleep meditation, then a night report of the day you actually had, encrypted on your phone.",
    screen: "nsdr",
    aura: "var(--amber)",
    stat: { label: "Tonight", value: "NSDR · 10 min" },
  },
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* ---------------- Principles marquee ---------------- */}
      <div className={s.marquee} aria-hidden="true">
        <div className={s.marqueeTrack}>
          {Array.from({ length: 2 }).map((_, k) => (
            <span key={k} className={s.marqueeGroup}>
              {["Private by default", "On-device Gemini Nano", "Unknown stays unknown", "You approve every action", "No cloud backup", "Built for real days", "Body and mind together"].map((t) => (
                <span key={t} className={s.marqueeItem}>
                  <RunnerMark size={16} /> {t}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* ---------------- Manifesto ---------------- */}
      <section id="manifesto" className="section">
        <div className="container">
          <span className="eyebrow">Why Grayvalve</span>
          <ScrollWords
            className={s.manifesto}
            text="Most health apps collect your life and hand back charts. Grayvalve does the opposite. It *reads* your night, *listens* to how you arrive, and turns both into one honest next move. It tells you what it doesn't know, and everything it learns *stays on your phone.*"
          />
          <div className={s.stats}>
            {[
              { to: 15, label: "Health Connect signals, each with its own consent" },
              { to: 12, label: "organ guides linking your signals to everyday care" },
              { to: 57, label: "accessible charts, each with a table view and spoken summary" },
              { to: 0, label: "bytes of personal data sent to our servers" },
            ].map((st, i) => (
              <Reveal key={st.label} delay={i * 0.08} className={s.stat}>
                <CountUp to={st.to} from={st.to === 0 ? 100 : 0} className={s.statNum} />
                <p>{st.label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- A day with Grayvalve ---------------- */}
      <section id="story" aria-label="A day with Grayvalve" className={s.storySection}>
        <div className="container">
          <div className={s.head}>
            <span className="eyebrow">A day with Grayvalve</span>
            <BlurText as="h2" className="h1" text={"From first light\nto lights out."} accent={["out."]} accentClassName="accent-text" />
            <p className="lede">Grayvalve fits around the day you already have. Scroll through one, in the order you&apos;d meet it.</p>
          </div>
        </div>
        <DayStory chapters={chapters} />
      </section>

      {/* ---------------- Body ---------------- */}
      <section id="body" className="section">
        <div className={s.bodyGlow} aria-hidden="true" />
        <div className="container" style={{ position: "relative" }}>
          <div className={s.split}>
            <div>
              <span className="eyebrow">Body</span>
              <BlurText as="h2" className="h1" style={{ marginTop: 18 }} text={"Every organ,\nunderstood."} accent={["understood."]} accentClassName="accent-text" />
            </div>
            <p className="lede">
              Grayvalve links each signal to the organ it speaks for, against your own usual range, with simple ways to look after it.
              Guidance only: it never diagnoses.
            </p>
          </div>
          <Reveal style={{ marginTop: 56 }}>
            <BodyAtlas organs={organs} autoPlay caption="Demo values. Your own appear once your phone is paired." />
          </Reveal>

          <div className={s.vitalStrip}>
            {[
              { label: "Resting HR", value: 58, unit: "bpm", wave: sample.restingHr.week, color: "var(--ember)" },
              { label: "HRV", value: 62, unit: "ms", wave: sample.hrv.week, color: "var(--jade)" },
              { label: "Steps", value: 6800, unit: "", wave: sample.steps.week, color: "var(--signal)" },
              { label: "Sleep", value: 6.8, unit: "h", wave: sample.sleep.week, color: "var(--lavender)", decimals: 1 },
            ].map((v, i) => (
              <Reveal key={v.label} delay={i * 0.08} className={`tile ${s.vital}`}>
                <span className={s.vitalLabel}>{v.label}</span>
                <div className={s.vitalNum}>
                  <CountUp to={v.value} decimals={v.decimals ?? 0} />
                  <small>{v.unit}</small>
                </div>
                <WaveLine data={v.wave} color={v.color} height={46} label={`${v.label} over the last 7 days`} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Mind ---------------- */}
      <section id="mind" className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={s.mindGrid}>
            <Reveal className={s.mindOrb}>
              <BreathOrb size={380} />
            </Reveal>
            <div>
              <span className="eyebrow">Mind</span>
              <BlurText as="h2" className="h1" style={{ marginTop: 18 }} text={"A calmer mind,\nmeasured gently."} accent={["gently."]} accentClassName="accent-text" />
              <p className="lede" style={{ marginTop: 22 }}>
                Breathwork, meditation, non-sleep deep rest and cognitive practice, with mood, energy and stress drawn as patterns, never as
                causes. Journal and therapy notes never leave your phone.
              </p>
              <div className={s.mindCards}>
                <div className={`tile ${s.mindCard}`}>
                  <div className="row wrap gap-12" style={{ justifyContent: "space-between" }}>
                    <span className={s.vitalLabel}>How you&apos;ve felt · 7 days</span>
                    <span className={s.legend}>
                      <i style={{ background: "var(--signal)" }} /> Mood <i style={{ background: "var(--amber)" }} /> Energy <i style={{ background: "var(--magenta)" }} /> Stress
                    </span>
                  </div>
                  <div style={{ position: "relative", height: 100 }}>
                    <div style={{ position: "absolute", inset: 0 }}>
                      <WaveLine data={sample.mood.week} min={1} max={5} height={100} label="Mood this week" />
                    </div>
                    <div style={{ position: "absolute", inset: 0 }}>
                      <WaveLine data={sample.mood.energy} min={1} max={5} height={100} fill={false} color="var(--amber)" label="Energy this week" />
                    </div>
                    <div style={{ position: "absolute", inset: 0 }}>
                      <WaveLine data={sample.mood.stress} min={1} max={5} height={100} fill={false} color="var(--magenta)" label="Stress this week" />
                    </div>
                  </div>
                </div>
                <div className={`tile ${s.mindCard}`}>
                  <span className={s.vitalLabel}>Practice minutes</span>
                  <Bars data={sample.mind.minutes} labels={["M", "T", "W", "T", "F", "S", "S"]} highlight={6} color="var(--violet)" height={90} label="Practice minutes per day" />
                </div>
                <ul className={s.practices}>
                  {mindPractices.map((p) => (
                    <li key={p.name} style={{ "--c": p.aura } as React.CSSProperties}>
                      <span />
                      <strong>{p.name}</strong>
                      <em>{p.minutes} min</em>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Feature explorer ---------------- */}
      <section id="features" className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={s.head}>
            <span className="eyebrow">Everything inside</span>
            <BlurText as="h2" className="h1" text="Built for the whole day." />
            <p className="lede">Check in, focus, breathe, move, reflect and rest. Each space has its own aura colour, so you always know where you are.</p>
          </div>
          <Reveal style={{ marginTop: 56 }}>
            <FeatureExplorer groups={featureGroups} />
          </Reveal>
          <div style={{ marginTop: 28, display: "flex", justifyContent: "center" }}>
            <Link href="/features" className="btn btn-glass">
              See every feature
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- Privacy ---------------- */}
      <section id="privacy" className={`section ${s.privacy}`}>
        <GsapParallax className={s.privacyLayers}>
          <div className={s.privacyArt} data-depth="0.35" aria-hidden="true">
            <Image src="/art/ribbon.webp" alt="" fill sizes="100vw" style={{ objectFit: "cover" }} />
          </div>
          <div className={s.privacyOrb} data-depth="-0.6" aria-hidden="true" />
        </GsapParallax>
        <div className="container" style={{ position: "relative" }}>
          <div className={s.head}>
            <span className="eyebrow">Security is the foundation</span>
            <BlurText as="h2" className="h1" text={"Your life stays\non your phone."} accent={["phone."]} accentClassName="accent-text" />
            <p className="lede">
              Health data, journal entries and check-ins are sealed by your phone&apos;s secure hardware. The web dashboard only ever sees what
              your phone streams to an open tab, end-to-end encrypted, and it keeps nothing.
            </p>
          </div>
          <div className="grid grid-3" style={{ marginTop: 56 }}>
            {securityPoints.map((p, i) => (
              <Reveal key={p.title} delay={(i % 3) * 0.08} className={`tile ${s.secCard}`}>
                <span className={s.secKey}>{p.k}</span>
                <h3 className="h3">{p.title}</h3>
                <p className="muted" style={{ margin: 0, fontSize: 15 }}>
                  {p.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Web dashboard ---------------- */}
      <section id="dashboard" className="section">
        <div className="container">
          <div className={s.head}>
            <span className="eyebrow">Web dashboard</span>
            <BlurText as="h2" className="h1" text="Your health, on the big screen." />
            <p className="lede">
              Sign in on the web, pair your phone, and watch readiness, sleep, recovery and mood stream in live, end-to-end encrypted. Until the
              app is released, explore the same dashboard with demo data and your own name.
            </p>
          </div>

          <TiltIn className={s.laptop}>
            <div className={s.laptopBar}>
              <span />
              <span />
              <span />
              <em>grayvalve.com/dashboard</em>
            </div>
            <div className={s.dash}>
              <div className={`aura aura-ember ${s.dashHero}`}>
                <span className={s.floatLabel}>Your next move</span>
                <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: "-0.02em", maxWidth: 260 }}>A 20-minute walk before your 14:00 call</div>
                <span className={s.floatSub}>Based on 6h 50m sleep and low movement</span>
              </div>
              <div className={`tile ${s.dashTile}`}>
                <span className={s.floatLabel}>Readiness</span>
                <DotMatrix value="72" dot={7} color="var(--content)" />
                <WaveLine data={[61, 64, 58, 70, 66, 74, 72]} height={46} label="Readiness this week" />
              </div>
              <div className={`tile ${s.dashTile}`}>
                <span className={s.floatLabel}>Resting heart rate</span>
                <div className="tnum" style={{ fontSize: 28, fontWeight: 500 }}>
                  58 <span className="faint" style={{ fontSize: 14 }}>bpm</span>
                </div>
                <RangeBand value={58} low={55} high={64} min={45} max={80} label="Resting heart rate 58, within baseline 55 to 64" />
              </div>
              <div className={`tile ${s.dashWide}`}>
                <span className={s.floatLabel}>Last night</span>
                <SleepStages label="Sleep stages last night" segments={sample.sleep.segments} />
              </div>
              <div className={`tile ${s.dashTile}`}>
                <span className={s.floatLabel}>Steps · 7 days</span>
                <Bars data={sample.steps.week} labels={["M", "T", "W", "T", "F", "S", "S"]} highlight={6} height={70} label="Steps per day this week" />
              </div>
            </div>
          </TiltIn>

          <div className="grid grid-3" style={{ marginTop: 32 }}>
            {[
              ["01", "Join the waitlist", "Leave your name and email. We'll tell you the moment the production app is released."],
              ["02", "Sign in for the demo", "Create an account and explore the dashboard with your name and demo data, Nano intelligence included."],
              ["03", "Pair when it's out", "Install the app, scan the pairing code once, and your real summaries replace the demo, live and encrypted."],
            ].map(([n, t, b], i) => (
              <Reveal key={n} delay={i * 0.1} className={`tile ${s.step}`}>
                <span className={s.stepNum}>{n}</span>
                <h3 className="h3">{t}</h3>
                <p className="muted" style={{ margin: 0, fontSize: 15 }}>
                  {b}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Nano intelligence ---------------- */}
      <section id="nano" className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={s.nanoGrid}>
            <div>
              <span className="eyebrow">Nano intelligence</span>
              <BlurText as="h2" className="h1" style={{ marginTop: 18 }} text={"Advice that never\nleaves your device."} accent={["never"]} accentClassName="accent-text" />
              <p className="lede" style={{ marginTop: 22 }}>
                Nano intelligence lives in your dashboard and runs on Gemini Nano inside your own browser. Ask how to sleep better, plan a
                week of meals around your training, or review your month. Your questions and your numbers never reach a server.
              </p>
              <ul className={s.nanoList}>
                <li>
                  <strong>Points to improve your health</strong>
                  <span>Grounded in your sleep, recovery, steps and mood.</span>
                </li>
                <li>
                  <strong>Meal preparation</strong>
                  <span>Day plans and shopping lists shaped by how you move.</span>
                </li>
                <li>
                  <strong>Deeper tracking</strong>
                  <span>Trends across weeks, with patterns described honestly, never as causes.</span>
                </li>
              </ul>
            </div>
            <Reveal>
              <NanoShowcase />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---------------- Roadmap preview ---------------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={s.split}>
            <div>
              <span className="eyebrow">Where we&apos;re going</span>
              <BlurText as="h2" className="h1" style={{ marginTop: 18 }} text="From an app to a complete circle of care." />
            </div>
            <p className="lede">
              Today Grayvalve works with the sensors you already own. Next, we&apos;re designing our own devices to track physical and mental health
              continuously, and to bring clinicians in when you choose. Every device will earn its claims through proper validation first.
            </p>
          </div>

          <Reveal className={s.timeline}>
            {horizons.map((h) => (
              <div key={h.when} className={s.tlItem}>
                <span className={`chip ${h.status === "Live" ? "signal" : h.status === "Building" ? "" : "concept"}`}>{h.status}</span>
                <span className={s.tlWhen}>{h.when}</span>
                <strong>{h.title}</strong>
              </div>
            ))}
          </Reveal>

          <div className="grid grid-3" style={{ marginTop: 40 }}>
            {deviceConcepts.map((d, i) => (
              <Reveal key={d.name} delay={i * 0.1}>
                <article className={s.device}>
                  <div className={s.deviceArt}>
                    <Image src={d.art} alt="" fill sizes="(max-width: 640px) 100vw, 33vw" style={{ objectFit: "cover" }} />
                  </div>
                  <div className={s.deviceBody}>
                    <span className="chip concept">{d.kind}</span>
                    <h3 className="h3" style={{ marginTop: 14 }}>
                      {d.name}
                    </h3>
                    <p className="muted" style={{ margin: "8px 0 0", fontSize: 15 }}>
                      {d.body}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          <div style={{ marginTop: 28, display: "flex", justifyContent: "center" }}>
            <Link href="/roadmap" className="btn btn-glass">
              Read the full roadmap
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- Waitlist ---------------- */}
      <section id="waitlist" className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal className={s.waitlist}>
            <div className={s.waitlistCopy}>
              <span className="eyebrow">Production release</span>
              <BlurText as="h2" className="h1" style={{ marginTop: 16 }} text={"Start tomorrow morning\nwith a plan that fits."} accent={["fits."]} accentClassName="accent-text" />
              <p className="lede" style={{ marginTop: 18 }}>
                Grayvalve isn&apos;t downloadable yet. Join the waitlist and we&apos;ll tell you the moment the production version is out. Until then,
                sign in to explore the dashboard with demo data.
              </p>
              <div className="row wrap gap-12" style={{ marginTop: 20 }}>
                <Link href="/demo" className="btn btn-glass btn-sm">
                  Explore the demo
                </Link>
                <Link href="/waitlist" className="btn btn-ghost btn-sm">
                  Questions
                </Link>
              </div>
            </div>
            <div className={`panel ${s.waitlistForm}`}>
              <WaitlistForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
