import { Aurora } from "@/components/motion/Aurora";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { deviceConcepts, horizons } from "@/lib/content";
import s from "../pages.module.css";

export const metadata: Metadata = {
  title: "Roadmap",
  description: "Where Grayvalve is going: the web dashboard, device pairing, and future medical-grade devices for physical and mental health.",
};

const principles = [
  { title: "Validation before claims", body: "No device will describe a health benefit until it has been tested for it and cleared where regulation requires." },
  { title: "Mental health, with care", body: "Stress and mood signals are shown as patterns you can correct, never as a diagnosis, and support is always one tap away." },
  { title: "You hold the keys", body: "Pairing is explicit and revocable. Sharing with a clinician is previewed first and access expires." },
  { title: "Useful without hardware", body: "Everything in the app keeps working on an affordable phone with no wearable at all." },
];

export default function RoadmapPage() {
  return (
    <>
      <section className={s.pageHero}>
        <Aurora stops={["#9fd0b7", "#e2fc5b", "#4a7ef2"]} />
        <div className={s.heroArt} aria-hidden="true">
          <Image src="/art/protein.webp" alt="" fill priority sizes="60vw" style={{ objectFit: "cover" }} />
        </div>
        <div className="container">
          <span className="eyebrow">Roadmap</span>
          <h1 className="display" style={{ marginTop: 22, maxWidth: "13ch" }}>
            A complete circle of care.
          </h1>
          <p className="lede" style={{ marginTop: 24 }}>
            Grayvalve starts as the app that runs your day. Over the next decade we plan to craft our own devices that track overall physical and
            mental health, and to connect them with clinicians when you choose. These are plans, ordered by evidence, not promised dates.
          </p>
        </div>
      </section>

      <section className="section-tight" style={{ paddingTop: 0 }}>
        <div className="container">
          {horizons.map((h) => (
            <div key={h.when} className={`${s.horizon} reveal`}>
              <div className={s.horizonWhen}>
                <span className={`chip ${h.status === "Live" ? "signal" : h.status === "Building" ? "" : "concept"}`}>{h.status}</span>
                {h.when}
              </div>
              <div>
                <h2 className="h2" style={{ fontSize: "clamp(26px, 2.6vw, 36px)" }}>
                  {h.title}
                </h2>
                <p className="lede" style={{ marginTop: 14 }}>
                  {h.body}
                </p>
              </div>
              <ul className={s.horizonItems}>
                {h.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="devices" className="section">
        <div className="container">
          <div className="reveal" style={{ maxWidth: 820, marginBottom: 56 }}>
            <span className="eyebrow">Future devices</span>
            <h2 className="h1" style={{ marginTop: 18 }}>
              Sensors designed around what matters.
            </h2>
            <p className="lede" style={{ marginTop: 18 }}>
              Each concept starts from a question the app already asks, such as how you slept, how recovered you are and how stressed you feel,
              and measures it more directly. All three are in research and not for sale.
            </p>
          </div>
          {deviceConcepts.map((d, i) => (
            <article key={d.name} className={`${s.deviceRow} reveal`}>
              <div className={s.deviceArt} style={{ order: i % 2 ? 2 : 0 }}>
                <Image src={d.art} alt="" fill sizes="(max-width: 960px) 100vw, 50vw" style={{ objectFit: "cover" }} />
              </div>
              <div className={s.deviceCopy}>
                <span className="chip concept" style={{ alignSelf: "flex-start" }}>
                  {d.kind}
                </span>
                <h3 className="h2">{d.name}</h3>
                <p className="lede">{d.body}</p>
                <div className={s.signals}>
                  {d.signals.map((sig) => (
                    <span key={sig} className="chip">
                      {sig}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="reveal" style={{ marginBottom: 40 }}>
            <span className="eyebrow">How we&apos;ll build them</span>
            <h2 className="h1" style={{ marginTop: 18 }}>
              Four promises for every device.
            </h2>
          </div>
          <div className={`${s.principles} reveal`}>
            {principles.map((p) => (
              <div key={p.title} className={s.principle}>
                <strong>{p.title}</strong>
                <p>{p.body}</p>
              </div>
            ))}
          </div>
          <div className="row wrap gap-12 reveal" style={{ marginTop: 48, justifyContent: "center" }}>
            <Link href="/signup" className="btn btn-primary">
              Follow along with an account
            </Link>
            <Link href="/waitlist" className="btn btn-glass">
              Get the app
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
