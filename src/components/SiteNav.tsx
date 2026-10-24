"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { navLinks } from "@/lib/site";
import styles from "./SiteNav.module.css";

export function SiteNav({ signedIn = false }: { signedIn?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className={`${styles.wrap} ${scrolled ? styles.scrolled : ""}`}>
      <nav className={styles.bar} aria-label="Main">
        <Link href="/" className={styles.brand} aria-label="Grayvalve home">
          <Logo size={20} />
        </Link>

        <ul className={styles.links}>
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className={pathname === l.href ? styles.active : undefined}>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          {signedIn ? (
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className={`btn btn-ghost btn-sm ${styles.signin}`}>
                Sign in
              </Link>
              <Link href="/download" className="btn btn-primary btn-sm">
                Get the app
              </Link>
            </>
          )}
          <button
            type="button"
            className={styles.burger}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>
      </nav>

      <div id="mobile-menu" className={`${styles.sheet} ${open ? styles.sheetOpen : ""}`} hidden={!open}>
        <ul>
          {navLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href}>{l.label}</Link>
            </li>
          ))}
          <li>
            <Link href={signedIn ? "/dashboard" : "/login"}>{signedIn ? "Dashboard" : "Sign in"}</Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
