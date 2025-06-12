import React, { useState } from "react";

// ✅ Use the good Sidebar and Header (Navbar) from layout
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Navbar"; // Rename to Header.jsx if needed
import Card from "@/components/ui/Card";

// ✅ Functional modules
import OutletManager from "./OutletManager";
import PendingSalesmen from "./PendingSalesmen";
import UserManager from "./UserManager";
import BaseUpload from "./BaseUpload";
import ProductManager from "./ProductManager";
import SalesUpload from "./SalesUpload";
import ClaimDashboard from "./ClaimDashboard";
import IncentiveControl from "./IncentiveControl";
import Streaks from "./Streaks";
import Leaderboard from "./Leaderboard";
import TraitsConfig from "./TraitsConfig";
import SetupPanel from "./SetupPanel";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);

  // ✅ Dynamically load selected module
  const renderSection = () => {
    switch (activeSection) {
      case "outlets": return <OutletManager key={refreshKey} />;
      case "pending": return <PendingSalesmen key={refreshKey} />;
      case "users": return <UserManager key={refreshKey} />;
      case "upload": return <BaseUpload key={refreshKey} />;
      case "products": return <ProductManager key={refreshKey} />;
      case "sales": return <SalesUpload key={refreshKey} />;
      case "claims": return <ClaimDashboard key={refreshKey} />;
      case "incentives": return <IncentiveControl key={refreshKey} />;
      case "streaks": return <Streaks key={refreshKey} />;
      case "leaderboard": return <Leaderboard key={refreshKey} />;
      case "traits": return <TraitsConfig key={refreshKey} />;
      case "setup": return <SetupPanel key={refreshKey} />;
      default:
        return <div className="text-xl font-semibold">Welcome to Admin Dashboard</div>;
    }
  };

  return (
    <div className="flex h-screen bg-pink-100 text-gray-900">
      {/* Sidebar (Sticky and collapsible) */}
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Right-hand Main Layout */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Sticky Top Header */}
        <Header />

        {/* Scrollable Module Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Centered Module Card with max width */}
          <div className="w-full max-w-6xl mx-auto">
            <Card title={activeSection.toUpperCase()}>
              {renderSection()}
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
