import { useState } from "react";

export default function Sidebar({ activeSection, setActiveSection }) {
  const [collapsed, setCollapsed] = useState(false);

  const sections = [
    { key: "setup", label: "Setup" },
    { key: "outlets", label: "Outlets" },
    { key: "pending", label: "Pending Salesmen" },
    { key: "users", label: "Users" },
    { key: "upload", label: "Upload Base" },
    { key: "products", label: "Products" },
    { key: "sales", label: "Sales Upload" },
    { key: "claims", label: "Claims" },
    { key: "incentives", label: "Incentives" },
    { key: "streaks", label: "Streaks" },
    { key: "leaderboard", label: "Leaderboard" },
    { key: "traits", label: "Traits Config" },
  ];

  return (
    <aside className={`bg-[#cc0000] text-white sticky top-0 h-screen transition-all ${collapsed ? "w-16" : "w-60"}`}>
      <div className="p-3">
        <button onClick={() => setCollapsed(!collapsed)} className="text-xs font-bold mb-4 w-full">
          {collapsed ? "»" : "« Collapse"}
        </button>
        {!collapsed && (
          <ul className="space-y-2 text-sm">
            {sections.map(({ key, label }) => (
              <li
                key={key}
                onClick={() => setActiveSection(key)}
                className={`cursor-pointer px-2 py-1 rounded hover:bg-red-800 ${
                  activeSection === key ? "bg-red-700" : ""
                }`}
              >
                {label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
