"use client";
import { usePathname } from "next/navigation"; 
import Link from "next/link";                 
import css from "./ProfileTabs.module.css"; 

const TABS = [
  { href: "/profile/label", label: "Збережені історії" },
  { href: "/profile/own", label: "Мої історії" },
];

export function ProfileTabs() {
  const pathname = usePathname();

  return (
    <div className={css.tabs}>
      {TABS.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={pathname === href ? css.tabActive : css.tab}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}