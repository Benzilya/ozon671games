"use client";

import { useEffect, useMemo, useState } from "react";

const publicBase = process.env.GITHUB_ACTIONS === "true" ? "/ozon671games" : "";

const files = [
  { key: "stories", label: "Истории", href: "/audiobooks.html", match: ["/audiobooks", "/stories/"] },
  { key: "films", label: "AI-фильмы", href: "/films.html", match: ["/films"] },
  { key: "characters", label: "Персонажи", href: "/characters.html", match: ["/characters"] },
  { key: "timeline", label: "Хронология", href: "/timeline.html", match: ["/timeline"] },
  { key: "universe", label: "Вселенная", href: "/universe.html", match: ["/universe"] },
  { key: "community", label: "Сообщество", href: "/community.html", match: ["/community"] },
] as const;

function normalizePath(pathname: string) {
  if (publicBase && pathname.startsWith(publicBase)) return pathname.slice(publicBase.length) || "/";
  return pathname;
}

export default function ArchiveTrail() {
  const [pathname, setPathname] = useState<string | null>(null);

  useEffect(() => {
    setPathname(normalizePath(window.location.pathname));
  }, []);

  const activeIndex = useMemo(() => {
    if (!pathname) return -1;
    return files.findIndex((file) => file.match.some((prefix) => pathname.startsWith(prefix)));
  }, [pathname]);

  if (!pathname || pathname === "/" || pathname.startsWith("/account") || pathname.startsWith("/admin") || pathname.startsWith("/search") || pathname.startsWith("/shop")) return null;

  const active = activeIndex >= 0 ? files[activeIndex] : null;
  const next = files[(activeIndex + 1 + files.length) % files.length];

  return (
    <nav className="archive-trail" aria-label="Переход между связанными разделами архива">
      <span className="archive-trail-index">CASE PATH</span>
      <a href={`${publicBase}/`} className="archive-trail-home">671 / INDEX</a>
      {active && <span className="archive-trail-current" aria-current="page">{active.label}</span>}
      <a href={`${publicBase}${next.href}`} className="archive-trail-next"><small>Следующее дело</small><strong>{next.label}</strong><span aria-hidden="true">→</span></a>
    </nav>
  );
}
