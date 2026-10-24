import Link from "next/link";
import { Logo } from "./Logo";

const cols = [
  {
    title: "Product",
    links: [
      { href: "/#product", label: "Today · Gray · Spaces" },
      { href: "/features", label: "All features" },
      { href: "/#organs", label: "Body & organs" },
      { href: "/#dashboard", label: "Web dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/roadmap", label: "Roadmap" },
      { href: "/roadmap#devices", label: "Future devices" },
      { href: "/#privacy", label: "Privacy & security" },
    ],
  },
  {
    title: "Get started",
    links: [
      { href: "/download", label: "Download for Android" },
      { href: "/signup", label: "Create an account" },
      { href: "/login", label: "Sign in" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer style={{ borderTop: "1px solid var(--border)", padding: "72px 0 40px", position: "relative", zIndex: 1 }}>
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.4fr) repeat(3, minmax(0,1fr))", gap: 40 }} className="footer-grid">
          <div className="stack gap-16">
            <Logo size={22} />
            <p className="muted" style={{ margin: 0, maxWidth: 320, fontSize: 14 }}>
              Your day, intelligently tuned. Private, on-device intelligence for body and mind.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title} className="stack gap-12">
              <span className="eyebrow plain">{c.title}</span>
              {c.links.map((l) => (
                <Link key={l.href} href={l.href} className="muted" style={{ fontSize: 14 }}>
                  {l.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <hr className="rule" style={{ margin: "56px 0 24px" }} />
        <div className="row wrap gap-16" style={{ justifyContent: "space-between", fontSize: 13 }}>
          <span className="faint">© {new Date().getFullYear()} Grayvalve. Wellbeing guidance, not medical advice.</span>
          <span className="faint">Device concepts shown are in research and are not available for sale.</span>
        </div>
      </div>
      <style>{`@media (max-width: 860px){.footer-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}@media (max-width:520px){.footer-grid{grid-template-columns:1fr!important}}`}</style>
    </footer>
  );
}
