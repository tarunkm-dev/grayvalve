import Image from "next/image";
import Link from "next/link";
import { DotMatrix } from "@/components/DotMatrix";
import { DownloadButton } from "@/components/DownloadButton";
import { Phone } from "@/components/Phone";
import { RunnerMark } from "@/components/Logo";
import { RootShowcase } from "@/components/home/RootShowcase";
import { FeatureExplorer } from "@/components/home/FeatureExplorer";
import { DayTimeline, type DayStop } from "@/components/home/DayTimeline";
import { Bars, RangeBand, SleepStages, TickMeter, WaveLine } from "@/components/charts";
import { deviceConcepts, featureGroups, horizons, roots, securityPoints, stats } from "@/lib/content";
import s from "./home.module.css";

const organs = [
  { id: "brain", name: "Brain", note: "Sleep, focus and stress" },
  { id: "heart", name: "Heart", note: "Resting HR and HRV" },
  { id: "lungs", name: "Lungs", note: "Breathing and SpO₂" },
  { id: "liver", name: "Liver", note: "Hydration and rest" },
  { id: "kidneys", name: "Kidneys", note: "Water and recovery" },
  { id: "thymus", name: "Thymus", note: "Immunity and sleep" },
  { id: "stomach", name: "Stomach", note: "Meals and timing" },
  { id: "intestines", name: "Intestines", note: "Routine and movement" },
  { id: "pancreas", name: "Pancreas", note: "Energy across the day" },
  { id: "thyroid", name: "Thyroid", note: "Temperature and energy" },
  { id: "urinary-system", name: "Urinary", note: "Hydration" },
  { id: "female-reproductive-system", name: "Reproductive", note: "Follows your choice" },
];

const dayStops: DayStop[] = [
  { time: "07:00", title: "Check in", body: "Mood, energy, stress and sleep in under a minute. Unknown stays unknown.", screen: "checkin", aura: "var(--magenta)" },
  { time: "07:05", title: "See your day", body: "Readiness and one next move, built from that check-in.", screen: "today", aura: "var(--ember)" },
  { time: "08:00", title: "Breathe", body: "Four minutes of box breathing when Gray suggests a calmer start.", screen: "breathwork", aura: "var(--ocean)" },
  { time: "09:30", title: "Deep work", body: "A focus timer that survives interruptions and logs only what you finished.", screen: "focus", aura: "var(--ocean)" },
  { time: "13:30", title: "Walk after lunch", body: "The next agenda item lights up. Tap it when it's done.", screen: "today-agenda", aura: "var(--signal)" },
  { time: "16:00", title: "Desk reset", body: "Guided moves with spoken cues, for when you've been sitting too long.", screen: "player", aura: "var(--amber)" },
  { time: "19:00", title: "Check your body", body: "Signals and seven-day trends, each with its source and freshness.", screen: "body-trends", aura: "var(--jade)" },
  { time: "21:30", title: "Reflect", body: "A short prompt for the end of the day, encrypted on your phone.", screen: "journal", aura: "var(--amber)" },
  { time: "22:30", title: "Wind down", body: "Non-sleep deep rest or a sleep meditation before lights out.", screen: "nsdr", aura: "var(--violet)" },
];

const palette = [
  { name: "Signal", hex: "#E2FC5B", role: "The one live accent", dark: true },
  { name: "Rare jade", hex: "#9FD0B7", role: "Recovery, body", dark: true },
  { name: "Floral dusk", hex: "#D8358F", role: "Sleep, rest" },
  { name: "Lavender", hex: "#CDA6D2", role: "Mind, calm", dark: true },
  { name: "Deep ocean", hex: "#4A7EF2", role: "Focus, deep work" },
  { name: "Ember", hex: "#D4553E", role: "Energy, warmth" },
  { name: "Solar amber", hex: "#F0A23B", role: "Movement", dark: true },
  { name: "Neural violet", hex: "#8D74F0", role: "Intelligence" },
];

const anchors = [
  { name: "Oxblood", hex: "#6D0808" },
  { name: "Nocturne", hex: "#2D0000" },
  { name: "Alloy sage", hex: "#757D6F" },
  { name: "Porcelain", hex: "#EEEAD7", dark: true },
];

export default function Home() {
  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className={s.hero}>
        <div className="aurora" aria-hidden="true" />
        <div className={s.heroArt} aria-hidden="true">
          <Image src="/art/lime-glass.webp" alt="" fill priority sizes="60vw" style={{ objectFit: "cover" }} />
        </div>
        <div className={`container ${s.heroGrid}`}>
          <div className={s.heroCopy}>
            <span className="eyebrow">Now on Android · Private, on-device AI</span>
            <h1 className="display" style={{ marginTop: 24 }}>
              Your day,
              <br />
              intelligently <span className={s.tuned}>tuned.</span>
            </h1>
            <p className="lede" style={{ marginTop: 28 }}>
              Grayvalve reads how you slept, asks how you&apos;re arriving, and builds a realistic day around your rhythm. Body and mind in one
              calm place, and everything stays on your phone.
            </p>
            <div className="row wrap gap-12" style={{ marginTop: 36 }}>
              <DownloadButton />
              <Link href="#product" className="btn btn-glass">
                Explore the app
                <span className="chevrons" aria-hidden="true">
                  <span>›</span>
                  <span>›</span>
                  <span>›</span>
                </span>
              </Link>
            </div>
            <ul className={s.trust}>
              <li>Android 11+</li>
              <li>Encrypted on device</li>
              <li>Wellbeing guidance, not medical advice</li>
            </ul>
          </div>

          <div className={s.heroStage}>
            <Phone src="/screens/today.webp" alt="Grayvalve Today screen with readiness and the next move" priority className={s.heroPhone} />

            <div className={`aura aura-jade ${s.float} ${s.floatA}`}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className={s.floatLabel}>Recovery</span>
                <span className="badge">↑ 6% vs baseline</span>
              </div>
              <div className="row gap-8" style={{ alignItems: "baseline" }}>
                <DotMatrix value="62" dot={7} color="#fff" label="HRV 62 milliseconds" />
                <span className={s.floatSub}>ms HRV</span>
              </div>
              <RangeBand value={62} low={48} high={66} min={30} max={80} label="HRV 62, within baseline 48 to 66" />
            </div>

            <div className={`aura aura-ocean ${s.float} ${s.floatB}`}>
              <span className={s.floatLabel}>Sleep</span>
              <div className="tnum" style={{ fontSize: 30, fontWeight: 500, letterSpacing: "-0.03em" }}>
                7h 40m
              </div>
              <TickMeter value={8} total={12} label="7 hours 40 minutes of sleep" />
            </div>

            <div className={`${s.float} ${s.floatC}`}>
              <span className={s.star} aria-hidden="true">
                ✦
              </span>
              <div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>Gray suggests</div>
                <div style={{ fontWeight: 500 }}>Take four minutes to breathe</div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
      <section className="section">
        <div className="container">
          <span className="eyebrow reveal">Why Grayvalve</span>
          <p className={`${s.manifesto} reveal`}>
            Most health apps collect data without giving you a way to act on it. Grayvalve treats every screen as a{" "}
            <em>decision surface</em>: it answers the question you came with in seconds, tells you what it doesn&apos;t know, and then gets out of
            your way.
          </p>
          <div className={`${s.stats} reveal`}>
            {stats.map((st) => (
              <div key={st.label} className={s.stat}>
                <DotMatrix value={st.value} dot={8} color="var(--signal)" />
                <p>{st.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Three roots ---------------- */}
      <section id="product" className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={`${s.head} reveal`}>
            <span className="eyebrow">The app</span>
            <h2 className="h1">Three places. Everything you need.</h2>
            <p className="lede">
              Today, Gray and Spaces are always one tap away on a floating glass bar. These are real screens from the app. Tap a number to see
              what each element does.
            </p>
          </div>
          <div className="reveal" style={{ marginTop: 64 }}>
            <RootShowcase roots={roots} />
          </div>
        </div>
      </section>

      {/* ---------------- Feature explorer ---------------- */}
      <section id="features" className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={`${s.head} reveal`}>
            <span className="eyebrow">Everything inside</span>
            <h2 className="h1">Built for the whole day.</h2>
            <p className="lede">
              Check in, focus, breathe, move, reflect and rest. Each space has its own aura colour, so you always know where you are.
            </p>
          </div>
          <div className="reveal" style={{ marginTop: 56 }}>
            <FeatureExplorer groups={featureGroups} />
          </div>
          <div className="reveal" style={{ marginTop: 28, display: "flex", justifyContent: "center" }}>
            <Link href="/features" className="btn btn-glass">
              See every feature
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- A day with Grayvalve ---------------- */}
      <section className="section" style={{ paddingTop: 0 }} aria-labelledby="day-title">
        <div className="container">
          <div className={`${s.head} reveal`} style={{ marginBottom: 56 }}>
            <span className="eyebrow">A day with Grayvalve</span>
            <h2 id="day-title" className="h1">
              From first light to lights out.
            </h2>
            <p className="lede">Grayvalve fits around the day you already have. Here&apos;s where it shows up, in the order you&apos;d meet it.</p>
          </div>
        </div>
        <div className="reveal">
          <DayTimeline stops={dayStops} />
        </div>
      </section>

      {/* ---------------- Design system ---------------- */}
      <section className="section">
        <div className="container">
          <div className={`${s.head} reveal`}>
            <span className="eyebrow">Aura Glass design system</span>
            <h2 className="h1">Colour lives inside the signal.</h2>
            <p className="lede">
              A pitch-black canvas keeps attention on your data. Each part of life has an aura that blooms out of a calm, near-black centre, and
              one Signal lime marks whatever is live right now.
            </p>
          </div>

          <div className={`${s.bento} reveal`}>
            <figure className={`tile ${s.bentoTall}`}>
              <Image src="/elements/observatory.webp" alt="Observatory tiles: dot-matrix signal with a baseline tick strip" width={720} height={856} />
              <figcaption>
                <strong>Observatory tiles</strong> Frosted squircles with a dotted inner frame, LED numerals and a tick strip against your baseline.
              </figcaption>
            </figure>
            <figure className="tile">
              <Image src="/elements/aura-card.webp" alt="Aura cards with status chips" width={720} height={799} />
              <figcaption>
                <strong>Aura cards</strong> Gradients tuned so text always passes AA contrast.
              </figcaption>
            </figure>
            <figure className="tile">
              <Image src="/elements/s6-gauge-ribbon.webp" alt="Goal gauge with a segmented ribbon" width={720} height={444} />
              <figcaption>
                <strong>Gauges & ribbons</strong> Progress you can read at a glance, with the Signal arc.
              </figcaption>
            </figure>
            <figure className="tile">
              <Image src="/elements/s7-night-cards-font200.webp" alt="Night report cards at 200% font size" width={720} height={708} />
              <figcaption>
                <strong>Built for 200% text</strong> Cards reflow instead of clipping.
              </figcaption>
            </figure>
            <figure className="tile">
              <Image src="/elements/evidence-card.webp" alt="Research-informed evidence card" width={720} height={565} />
              <figcaption>
                <strong>Evidence cards</strong> Every practice shows its summary, its limits and its source.
              </figcaption>
            </figure>
          </div>

          <div className={`${s.palette} reveal`}>
            {palette.map((p) => (
              <div key={p.name} className={s.swatch} style={{ background: p.hex, color: p.dark ? "#111" : "#fff" }}>
                <span className={s.swatchName}>{p.name}</span>
                <span className={s.swatchMeta}>
                  {p.hex}
                  <br />
                  {p.role}
                </span>
              </div>
            ))}
          </div>
          <div className={`${s.anchors} reveal`}>
            <span className="faint" style={{ fontSize: 13 }}>
              Brand anchors
            </span>
            {anchors.map((a) => (
              <span key={a.name} className={s.anchor}>
                <span style={{ background: a.hex }} />
                {a.name} <span className="faint tnum">{a.hex}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Organs ---------------- */}
      <section id="organs" className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={`${s.split} reveal`}>
            <div>
              <span className="eyebrow">Body</span>
              <h2 className="h1" style={{ marginTop: 18 }}>
                Understand the body you live in.
              </h2>
            </div>
            <p className="lede">
              Twelve organ guides show how each organ contributes, how to look after it, which of your signals relate to it, and exercises that
              help. Guidance only: Grayvalve never diagnoses.
            </p>
          </div>
          <div className={`${s.organs} reveal`}>
            {organs.map((o) => (
              <figure key={o.id} className={s.organ}>
                <Image src={`/organs/${o.id}.webp`} alt={`${o.name} illustration`} width={360} height={360} sizes="(max-width: 640px) 45vw, 240px" />
                <figcaption>
                  <strong>{o.name}</strong>
                  <span>{o.note}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Privacy ---------------- */}
      <section id="privacy" className={`section ${s.privacy}`}>
        <div className={s.privacyArt} aria-hidden="true">
          <Image src="/art/ribbon.webp" alt="" fill sizes="100vw" style={{ objectFit: "cover" }} />
        </div>
        <div className="container" style={{ position: "relative" }}>
          <div className={`${s.head} reveal`}>
            <span className="eyebrow">Security is the foundation</span>
            <h2 className="h1">Your life stays on your phone.</h2>
            <p className="lede">
              Grayvalve was built security-first. Health data, journal entries and check-ins are sealed by your phone&apos;s secure hardware and
              never leave it unless you choose to share.
            </p>
          </div>
          <div className={`grid grid-3 reveal`} style={{ marginTop: 56 }}>
            {securityPoints.map((p) => (
              <div key={p.title} className={`tile ${s.secCard}`}>
                <span className={s.secKey}>{p.k}</span>
                <h3 className="h3">{p.title}</h3>
                <p className="muted" style={{ margin: 0, fontSize: 15 }}>
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Web dashboard + pairing ---------------- */}
      <section id="dashboard" className="section">
        <div className="container">
          <div className={`${s.head} reveal`}>
            <span className="eyebrow">Coming next · Web dashboard</span>
            <h2 className="h1">Your health, on the big screen.</h2>
            <p className="lede">
              Sign in on the web and pair your phone to see readiness, sleep, recovery and mind minutes side by side. Pairing is explicit, encrypted
              and revocable at any time.
            </p>
          </div>

          <div className={`${s.laptop} reveal`}>
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
                <SleepStages
                  label="Sleep stages last night"
                  segments={[
                    { stage: "Light", min: 30 },
                    { stage: "Deep", min: 55 },
                    { stage: "Light", min: 40 },
                    { stage: "REM", min: 25 },
                    { stage: "Awake", min: 8 },
                    { stage: "Light", min: 50 },
                    { stage: "Deep", min: 35 },
                    { stage: "REM", min: 40 },
                    { stage: "Light", min: 45 },
                    { stage: "REM", min: 30 },
                    { stage: "Awake", min: 7 },
                  ]}
                />
              </div>
              <div className={`tile ${s.dashTile}`}>
                <span className={s.floatLabel}>Steps · 7 days</span>
                <Bars data={[6200, 8400, 5100, 9900, 7300, 11200, 6800]} labels={["M", "T", "W", "T", "F", "S", "S"]} highlight={6} height={70} label="Steps per day this week" />
              </div>
            </div>
          </div>

          <div className={`grid grid-3 reveal`} style={{ marginTop: 32 }}>
            {[
              ["01", "Sign in on the web", "Create your Grayvalve account with email, then open Devices in the dashboard."],
              ["02", "Pair from the app", "Choose Pair in the app's Systems space and scan the code on screen. Codes expire in ten minutes."],
              ["03", "Choose what syncs", "Wearables reach your phone over Bluetooth LE; your phone syncs to the dashboard over Wi-Fi or mobile data, encrypted in transit."],
            ].map(([n, t, b]) => (
              <div key={n} className={`tile ${s.step}`}>
                <span className={s.stepNum}>{n}</span>
                <h3 className="h3">{t}</h3>
                <p className="muted" style={{ margin: 0, fontSize: 15 }}>
                  {b}
                </p>
              </div>
            ))}
          </div>
          <div className="reveal row wrap gap-12" style={{ marginTop: 28, justifyContent: "center" }}>
            <Link href="/signup" className="btn btn-primary">
              Create your account
            </Link>
            <Link href="/login" className="btn btn-glass">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- Roadmap preview ---------------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={`${s.split} reveal`}>
            <div>
              <span className="eyebrow">Where we&apos;re going</span>
              <h2 className="h1" style={{ marginTop: 18 }}>
                From an app to a complete circle of care.
              </h2>
            </div>
            <p className="lede">
              Today Grayvalve works with the sensors you already own. Next, we&apos;re designing our own devices to track physical and mental health
              continuously, and to bring clinicians in when you choose. Every device will earn its claims through proper validation first.
            </p>
          </div>

          <div className={`${s.timeline} reveal`}>
            {horizons.map((h) => (
              <div key={h.when} className={s.tlItem}>
                <span className={`chip ${h.status === "Live" ? "signal" : h.status === "Building" ? "" : "concept"}`}>{h.status}</span>
                <span className={s.tlWhen}>{h.when}</span>
                <strong>{h.title}</strong>
              </div>
            ))}
          </div>

          <div className={`grid grid-3 reveal`} style={{ marginTop: 40 }}>
            {deviceConcepts.map((d) => (
              <article key={d.name} className={s.device}>
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
            ))}
          </div>
          <div className="reveal" style={{ marginTop: 28, display: "flex", justifyContent: "center" }}>
            <Link href="/roadmap" className="btn btn-glass">
              Read the full roadmap
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- Download CTA ---------------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className={`aura aura-signal ${s.cta} reveal`}>
            <div className={s.ctaCopy}>
              <span className="eyebrow plain" style={{ color: "rgba(17,17,17,0.7)" }}>
                Get Grayvalve
              </span>
              <h2 className="h1" style={{ marginTop: 16, color: "#111" }}>
                Start tomorrow morning with a plan that fits.
              </h2>
              <p style={{ color: "rgba(17,17,17,0.75)", fontSize: 18, margin: "18px 0 0", maxWidth: 520 }}>
                Free on Android 11 and newer. No account needed to use the app; sign in only when you want the web dashboard.
              </p>
              <div className="row wrap gap-12" style={{ marginTop: 30 }}>
                <DownloadButton />
                <Link href="/download" className="btn" style={{ background: "rgba(17,17,17,0.9)", color: "var(--content)" }}>
                  Requirements & FAQ
                </Link>
              </div>
            </div>
            <div className={s.ctaPhones}>
              <Phone src="/screens/focus.webp" alt="Grayvalve Focus timer" className={s.ctaPhoneA} />
              <Phone src="/screens/spaces.webp" alt="Grayvalve Spaces" className={s.ctaPhoneB} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
