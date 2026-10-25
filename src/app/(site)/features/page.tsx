import { Aurora } from "@/components/motion/Aurora";
import type { Metadata } from "next";
import Image from "next/image";
import { Phone } from "@/components/Phone";
import Link from "next/link";
import { featureGroups, roots } from "@/lib/content";
import s from "../pages.module.css";

export const metadata: Metadata = {
  title: "Features",
  description: "Every Grayvalve feature: Today, Gray, Spaces, check-in, focus, mind, body, move, grow, journal, insights and bedtime.",
};

const extras = [
  { title: "Onboarding with Gray's voice", body: "Six short steps (name, rhythm, goals, protection and health), each spoken by Gray with a mute toggle." },
  { title: "Gray Therapy (beta)", body: "Four versioned protocols, before and after ratings, a weekly plan and a crisis path on every message." },
  { title: "Calendar and alarms", body: "Meetings read from your phone's calendars, read-only, with a ten-minute heads-up and Gray's chime." },
  { title: "Searchable settings", body: "Every setting is searchable. Living, Deep or Match system appearance, reduce motion and reduce transparency." },
  { title: "On-device search", body: "Typo-tolerant search across goals, journal, memory and habits, inside the encrypted vault." },
  { title: "57-chart library", body: "Every chart has a spoken summary and a table view showing the same numbers." },
];

export default function FeaturesPage() {
  return (
    <>
      <section className={s.pageHero}>
        <Aurora stops={["#d4553e", "#e2fc5b", "#8d74f0"]} />
        <div className={s.heroArt} aria-hidden="true">
          <Image src="/art/lime-rings.webp" alt="" fill priority sizes="60vw" style={{ objectFit: "cover" }} />
        </div>
        <div className="container">
          <span className="eyebrow">Features</span>
          <h1 className="display" style={{ marginTop: 22, maxWidth: "12ch" }}>
            Everything Grayvalve does today.
          </h1>
          <p className="lede" style={{ marginTop: 24 }}>
            Every screen below is a real capture from the Android app. Nothing here is a mock-up, and nothing is promised that the app doesn&apos;t do.
          </p>
        </div>
      </section>

      <section className="section-tight" style={{ paddingTop: 0 }}>
        <div className="container">
          {roots.map((r) => (
            <div key={r.id} className={s.group}>
              <div className={s.groupPhone}>
                <div className={`aura aura-${r.aura} no-frame ${s.groupGlow}`} aria-hidden="true" />
                <Phone src={r.screen} alt={`Grayvalve ${r.label}`} />
              </div>
              <div>
                <span className="eyebrow">{r.eyebrow}</span>
                <h2 className="h2" style={{ marginTop: 16 }}>
                  {r.title}
                </h2>
                <p className="lede" style={{ marginTop: 16 }}>
                  {r.body}
                </p>
                <div className={s.featureList}>
                  {r.hotspots.map((h) => (
                    <div key={h.title} className={s.featureItem}>
                      <strong>{h.title}</strong>
                      <p>{h.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {featureGroups.map((g) => (
            <div key={g.id} id={g.id} className={s.group}>
              <div className={s.groupPhone}>
                <div className={`aura aura-${g.aura} no-frame ${s.groupGlow}`} aria-hidden="true" />
                <Phone src={g.screen} alt={`Grayvalve ${g.name}`} />
              </div>
              <div>
                <span className="eyebrow">{g.name}</span>
                <h2 className="h2" style={{ marginTop: 16 }}>
                  {g.summary}
                </h2>
                <div className={s.featureList}>
                  {g.items.map((it) => (
                    <div key={it.title} className={s.featureItem}>
                      <strong>{it.title}</strong>
                      <p>{it.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className={s.group}>
            <div>
              <span className="eyebrow">And more</span>
              <h2 className="h2" style={{ marginTop: 16 }}>
                The details that make it dependable.
              </h2>
            </div>
            <div className={s.featureList} style={{ marginTop: 0 }}>
              {extras.map((it) => (
                <div key={it.title} className={s.featureItem}>
                  <strong>{it.title}</strong>
                  <p>{it.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="row wrap gap-12" style={{ justifyContent: "center", paddingTop: 40 }}>
            <Link href="/waitlist" className="btn btn-primary">
              Join the waitlist
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
