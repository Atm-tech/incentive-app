import { useState } from "react";

export default function Sidebar({ activeSection, setActiveSection }) {
  const [collapsed, setCollapsed] = useState(false);

  const sections = [
    { key: "setup", label: "Setup" },
    { key: "pending", label: "Pending Salesmen" },
    { key: "products", label: "Products" },
    { key: "traits", label: "Traits Config" },
    { key: "setincentives", label: "Set Incentives" },
    { key: "adminsales", label: "Sales Report" },
    { key: "reward", label: "Reward Winners" },
    { key: "users", label: "Users" },
    { key: "claims", label: "Claims" },
    { key: "upload", label: "Upload Base" },
    { key: "sales", label: "Sales Upload" },
    { key: "incentives", label: "Incentives" },
    { key: "leaderboard", label: "Leaderboard" },
    { key: "outlets", label: "Outlets" },
    { key: "streaks", label: "Streaks" },
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
