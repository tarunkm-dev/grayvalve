"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import s from "./dashboard.module.css";

const items = [
  { href: "/dashboard", label: "Overview", icon: "M3 12l9-8 9 8M5 10v10h5v-6h4v6h5V10" },
  { href: "/dashboard/body", label: "Body", icon: "M3 12h4l2-6 4 12 2-6h6" },
  { href: "/dashboard/mind", label: "Mind", icon: "M12 3l2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2z" },
  { href: "/dashboard/devices", label: "Devices", icon: "M8 3h8a1 1 0 011 1v16a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1zM11 18h2" },
  { href: "/dashboard/account", label: "Account", icon: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" },
];

function Icon({ d }: { d: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

export function DashNav({ variant }: { variant: "side" | "bottom" }) {
  const path = usePathname();
  const isActive = (href: string) => (href === "/dashboard" ? path === href : path.startsWith(href));

  return (
    <ul className={variant === "side" ? s.sideNav : s.bottomNav}>
      {items.map((it) => (
        <li key={it.href}>
          <Link href={it.href} className={isActive(it.href) ? s.navOn : undefined} aria-current={isActive(it.href) ? "page" : undefined}>
            <Icon d={it.icon} />
            <span>{it.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
