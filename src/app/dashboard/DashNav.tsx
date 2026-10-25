"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import s from "./dashboard.module.css";

const ICONS = {
  overview: "M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  body: "M3 12h4l2-6 4 12 2-6h6",
  mind: "M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z",
  analytics: "M4 20V10M10 20V4M16 20v-7M22 20H2",
  devices: "M8 3h8a1 1 0 011 1v16a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1zM11 18h2",
  account: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",
};

/** The dashboard's pages; the demo shows the first four under /demo. */
function itemsFor(base: "/dashboard" | "/demo") {
  const all = [
    { href: base, label: "Overview", icon: ICONS.overview },
    { href: `${base}/body`, label: "Body", icon: ICONS.body },
    { href: `${base}/mind`, label: "Mind", icon: ICONS.mind },
    { href: `${base}/insights`, label: "Analytics", icon: ICONS.analytics },
    { href: "/dashboard/devices", label: "Devices", icon: ICONS.devices },
    { href: "/dashboard/account", label: "Account", icon: ICONS.account },
  ];
  return base === "/demo" ? all.slice(0, 4) : all;
}

function Icon({ d }: { d: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export function DashNav({ variant, base = "/dashboard" }: { variant: "side" | "bottom"; base?: "/dashboard" | "/demo" }) {
  const path = usePathname();
  const isActive = (href: string) => (href === base ? path === href : path.startsWith(href));

  return (
    <ul className={variant === "side" ? s.sideNav : s.bottomNav}>
      {itemsFor(base).map((it) => (
        <li key={it.href}>
          <Link href={it.href} className={isActive(it.href) ? s.navOn : undefined} aria-current={isActive(it.href) ? "page" : undefined}>
            {isActive(it.href) && variant === "side" && <motion.span layoutId="nav-pill" className={s.navPill} transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
            <Icon d={it.icon} />
            <span>{it.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
