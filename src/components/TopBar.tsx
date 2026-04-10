import { useState, useRef, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";

type LinkDef = [string, string];

type NavItem =
  | { type: "link"; to: string; label: string }
  | { type: "dropdown"; label: string; links: LinkDef[] };

const nav: NavItem[] = [
  { type: "link", to: "/", label: "Overview" },
  {
    type: "dropdown",
    label: "Library",
    links: [
      ["/favorites", "Favorites"],
      ["/artists",   "Artists"],
      ["/albums",    "Albums"],
      ["/genres",    "Genres"],
    ],
  },
  {
    type: "dropdown",
    label: "Insights",
    links: [
      ["/popularity", "Popularity"],
      ["/duration",   "Duration"],
      ["/explicit",   "Explicit"],
      ["/discovery",  "Discovery"],
    ],
  },
  {
    type: "dropdown",
    label: "Timeline",
    links: [
      ["/activity", "Activity"],
      ["/years",    "Years"],
      ["/perYears", "Per Years"],
      ["/decades",  "Decades"],
    ],
  },
];

function Dropdown({ label, links }: { label: string; links: LinkDef[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isActive = links.some(([to]) => location.pathname === to);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 rounded-xl px-4 py-2 text-sm transition ${
          isActive
            ? "bg-emerald-500 text-black font-medium"
            : "text-slate-300 hover:bg-slate-800"
        }`}
      >
        {label}
        <svg
          width="10" height="6" viewBox="0 0 10 6" fill="currentColor"
          className={`mt-px transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="M0 0l5 6 5-6H0Z" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[148px] overflow-hidden rounded-xl border border-slate-700 bg-slate-900 py-1 shadow-xl">
          {links.map(([to, lbl]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2 text-sm transition ${
                  isActive
                    ? "bg-emerald-500/20 text-emerald-400 font-medium"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              {lbl}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Topbar() {
  return (
    <header className="border-b border-slate-800 bg-slate-950 px-6 py-3">
      <div className="flex items-center gap-6">
        <span className="text-xl font-bold shrink-0">🎵 Dashboard</span>

        <nav className="flex items-center gap-1">
          {nav.map((item) =>
            item.type === "link" ? (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-2 text-sm transition ${
                    isActive
                      ? "bg-emerald-500 text-black font-medium"
                      : "text-slate-300 hover:bg-slate-800"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ) : (
              <Dropdown key={item.label} label={item.label} links={item.links} />
            )
          )}
        </nav>
      </div>
    </header>
  );
}