import type { Metadata } from "next";
import Link from "next/link";
import { Phone } from "@/components/Phone";
import { AndroidIcon } from "@/components/DownloadButton";
import { site } from "@/lib/site";
import s from "../pages.module.css";

export const metadata: Metadata = {
  title: "Download",
  description: "Download Grayvalve for Android 11 and newer.",
};

const faqs = [
  {
    q: "Is Grayvalve free?",
    a: "Yes. Planning, routines, reflection, accessibility and your privacy controls are free. If we add paid features later, they will cover costly extras such as expanded AI, never your basic data controls.",
  },
  {
    q: "Do I need an account?",
    a: "No. The app works fully on your phone without one. An account is only needed for the web dashboard and, later, for pairing devices.",
  },
  {
    q: "Do I need a smartwatch?",
    a: "No. Grayvalve reads Health Connect if you have it, and everything works from your own check-ins if you don't. Unknown values stay unknown rather than being guessed.",
  },
  {
    q: "Where is my data stored?",
    a: "On your phone, in an AES-256 encrypted database whose key is sealed in Android Keystore. Grayvalve has no cloud backup. Map tiles are the only network requests unless you allow route planning.",
  },
  {
    q: "Is there an iPhone version?",
    a: "Not yet. We're focused on making Android dependable first, and iOS will follow.",
  },
  {
    q: "Is Grayvalve a medical device?",
    a: "No. The app offers wellbeing guidance, not medical advice, and never diagnoses. Future Grayvalve devices that make health claims will go through the regulatory clearance they require first.",
  },
];

export default function DownloadPage() {
  const hasUrl = Boolean(site.androidDownloadUrl);
  return (
    <>
      <section className={s.pageHero}>
        <div className="aurora" aria-hidden="true" />
        <div className={`container ${s.dlGrid}`}>
          <div>
            <span className="eyebrow">Download</span>
            <h1 className="display" style={{ marginTop: 22 }}>
              Get Grayvalve.
            </h1>
            <p className="lede" style={{ marginTop: 24 }}>
              Free for Android 11 and newer. Install it tonight, check in tomorrow morning, and let Gray build your first day.
            </p>
            <div className="row wrap gap-12" style={{ marginTop: 32 }}>
              {hasUrl ? (
                <a href={site.androidDownloadUrl} className="btn btn-primary" rel="noopener">
                  <AndroidIcon /> Download for Android
                </a>
              ) : (
                <>
                  <Link href="/signup" className="btn btn-primary">
                    <AndroidIcon /> Join the Android beta
                  </Link>
                  <span className="chip">Google Play listing coming soon</span>
                </>
              )}
            </div>
            {!hasUrl && (
              <p className="faint" style={{ fontSize: 14, marginTop: 16, maxWidth: 520 }}>
                The Google Play listing isn&apos;t live yet. Create an account now to be first in line for the Android beta.
              </p>
            )}

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
                Gemini Nano when available
              </div>
              <div className={s.reqItem}>
                <span>Account</span>
                Optional
              </div>
            </div>
          </div>
          <div style={{ display: "grid", placeItems: "center" }}>
            <Phone src="/screens/gray.webp" alt="Grayvalve: Hi, I'm Gray" priority style={{ maxWidth: 300 }} />
          </div>
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
