import type { Metadata } from "next";
import Link from "next/link";
import { Phone } from "@/components/Phone";
import { WaitlistForm } from "@/components/WaitlistForm";
import { Aurora } from "@/components/motion/Aurora";
import { BlurText } from "@/components/motion/BlurText";
import { Parallax, Reveal } from "@/components/motion/Parallax";
import { site } from "@/lib/site";
import s from "../pages.module.css";

export const metadata: Metadata = {
  title: "Join the waitlist",
  description: "Grayvalve is getting ready for its production release. Join the waitlist to hear the moment it's out.",
};

const faqs = [
  {
    q: "When can I download Grayvalve?",
    a: "When the production version is released. We're finishing it now and won't ship a version we wouldn't trust with our own health data. Everyone on the waitlist hears first, by one email.",
  },
  {
    q: "Can I use the web dashboard before then?",
    a: "Yes, as a demo. Create an account and you'll see an interactive dashboard with your name and illustrative demo data, so you can see how Grayvalve will show your health. Your real dashboard opens once you pair the app.",
  },
  {
    q: "Is Grayvalve free?",
    a: "Planning, routines, reflection, accessibility and your privacy controls will be free. If we add paid features later, they will cover costly extras such as expanded AI, never your basic data controls.",
  },
  {
    q: "Do I need a smartwatch?",
    a: "No. Grayvalve reads Health Connect if you have it, and everything works from your own check-ins if you don't. Unknown values stay unknown rather than being guessed.",
  },
  {
    q: "Where will my data be stored?",
    a: "On your phone, in an AES-256 encrypted database whose key is sealed in Android Keystore. The web dashboard only shows what your phone streams to an open tab, end-to-end encrypted, and keeps nothing.",
  },
  {
    q: "Is there an iPhone version?",
    a: "Android comes first. Choose iPhone when you join and we'll tell you when iOS is ready.",
  },
  {
    q: "Is Grayvalve a medical device?",
    a: "No. It offers wellbeing guidance, not medical advice, and never diagnoses. Future Grayvalve devices that make health claims will go through the regulatory clearance they require first.",
  },
];

export default function WaitlistPage() {
  return (
    <>
      <section className={s.pageHero}>
        <Aurora stops={["#4a7ef2", "#e2fc5b", "#8d74f0"]} />
        <div className={`container ${s.dlGrid}`}>
          <div>
            <span className="eyebrow">
              <span className="shiny">Production release · waitlist open</span>
            </span>
            <BlurText as="h1" className="display" text={"Be first\nin line."} accent={["line"]} accentClassName="accent-text" trigger="mount" style={{ marginTop: 22 }} />
            <p className="lede" style={{ marginTop: 24 }}>
              Grayvalve is being readied for its production release. Leave your name and email and we&apos;ll tell you the moment it&apos;s out.
              Nothing else.
            </p>
            <Reveal delay={0.3} style={{ marginTop: 32, maxWidth: 560 }}>
              <div className="panel" style={{ padding: 22 }}>
                <WaitlistForm />
              </div>
            </Reveal>

            <div className={s.req} style={{ marginTop: 40 }}>
              <div className={s.reqItem}>
                <span>Requires</span>
                {site.minAndroid}
              </div>
              <div className={s.reqItem}>
                <span>Best with</span>
                Health Connect
              </div>
              <div className={s.reqItem}>
                <span>On-device AI</span>
                Gemini Nano
              </div>
              <div className={s.reqItem}>
                <span>Meanwhile</span>
                <Link href="/demo" style={{ color: "var(--signal)" }}>
                  Try the demo
                </Link>
              </div>
            </div>
          </div>
          <Parallax speed={0.12} style={{ display: "grid", placeItems: "center" }}>
            <Phone src="/screens/gray.webp" alt="Grayvalve: Hi, I'm Gray" priority style={{ maxWidth: 300 }} />
          </Parallax>
        </div>
      </section>

      <section className="section-tight">
        <div className="container" style={{ maxWidth: 900 }}>
          <h2 className="h2" style={{ marginBottom: 32 }}>
            Questions
          </h2>
          <div className={s.faq}>
            {faqs.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
