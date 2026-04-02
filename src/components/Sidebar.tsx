import { NavLink } from "react-router-dom";

const links = [
  ["/", "Overview"],
  ["/artists", "Artists"],
  ["/genres", "Genres"],
  ["/popularity", "Popularity"],
  ["/duration", "Duration"],
  ["/years", "Years"],
  ["/perYears",'Per Years']
];

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-950 p-4">
      <h1 className="mb-6 text-2xl font-bold">🎵 Dashboard</h1>

      <nav className="space-y-2">
        {links.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `block rounded-xl px-4 py-3 transition ${
                isActive
                  ? "bg-emerald-500 text-black"
                  : "text-slate-300 hover:bg-slate-800"
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}