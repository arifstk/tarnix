// components/SocialLinks.tsx

"use client";
import { useEffect, useState } from "react";

interface SocialSettings {
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
}

const SOCIAL_CONFIG = [
  {
    key: "facebook",
    label: "Facebook",
    color: "hover:text-blue-500",
    icon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    key: "instagram",
    label: "Instagram",
    color: "hover:text-pink-500",
    icon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    key: "twitter",
    label: "Twitter / X",
    color: "hover:text-sky-400",
    icon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: "youtube",
    label: "YouTube",
    color: "hover:text-rose-500",
    icon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
];

interface SocialLinksProps {
  variant?: "icon-only" | "icon-label" | "label-only";
  size?: "sm" | "md" | "lg";
  direction?: "row" | "column";
  baseColor?: string;
  className?: string;
}

// ── Compute link className outside JSX ────────────────────────
function getLinkClass(
  variant: "icon-only" | "icon-label" | "label-only",
  wrapperSize: string,
  baseColor: string,
  hoverColor: string
): string {
  const base = `flex items-center gap-2 transition-all duration-200 ${baseColor} ${hoverColor}`;
  if (variant === "icon-only") {
    return `${base} ${wrapperSize} rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] flex items-center justify-center`;
  }
  if (variant === "icon-label") {
    return `${base} px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] text-sm font-medium`;
  }
  // label-only
  return `${base} text-sm font-medium hover:underline underline-offset-2`;
}

// ═══════════════════════════════════════════════════════════════
export default function SocialLinks({
  variant = "icon-only",
  size = "md",
  direction = "row",
  baseColor = "text-slate-400",
  className = "",
}: SocialLinksProps) {
  const [socials, setSocials] = useState<SocialSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => { if (data.success) setSocials(data.settings); })
      .finally(() => setLoading(false));
  }, []);

  const wrapperSize = size === "sm" ? "w-7 h-7" : size === "lg" ? "w-11 h-11" : "w-9 h-9";
  const iconSize = size === "sm" ? "w-3.5 h-3.5" : size === "lg" ? "w-6 h-6" : "w-5 h-5";

  const activeLinks = SOCIAL_CONFIG.filter((s) => {
    const href = socials?.[s.key as keyof SocialSettings];
    return href && href.trim() !== "";
  });

  if (loading) {
    return (
      <div className={`flex gap-2 ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className={`${wrapperSize} rounded-lg bg-slate-200 animate-pulse`} />
        ))}
      </div>
    );
  }

  if (!socials || activeLinks.length === 0) return null;

  return (
    <div className={`flex ${direction === "column" ? "flex-col" : "flex-row"} gap-2 flex-wrap ${className}`}>
      {activeLinks.map((s) => {
        const href = socials[s.key as keyof SocialSettings];
        const linkClass = getLinkClass(variant, wrapperSize, baseColor, s.color);

        return (
          /* Fixed: Changed <div> to <a> so href, target, and rel are valid */
          <a
            key={s.key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={s.label}
            title={s.label}
            className={linkClass}
          >
            {variant !== "label-only" && (
              <span className={iconSize}>{s.icon}</span>
            )}
            {variant !== "icon-only" && (
              <span>{s.label}</span>
            )}
          </a>
        );
      })}
    </div>
  );
}

