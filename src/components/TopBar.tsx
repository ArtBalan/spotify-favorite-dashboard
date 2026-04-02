import { NavLink } from "react-router-dom";

const links = [
  ["/", "Overview"],
  ["/artists", "Artists"],
  ["/genres", "Genres"],
  ["/popularity", "Popularity"],
  ["/duration", "Duration"],
  ["/years", "Years"],
  ["/perYears", "Per Years"],
];

export default function Topbar() {
  return (
    <header className="border-b border-slate-800 bg-slate-950 px-6 py-3">
      <div className="flex items-center gap-6">
        <span className="text-xl font-bold shrink-0">🎵 Dashboard</span>

        <nav className="flex items-center gap-1">
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `rounded-xl px-4 py-2 text-sm transition ${
                  isActive
                    ? "bg-emerald-500 text-black font-medium"
                    : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}