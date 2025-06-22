import React, { useState } from "react";

// Layout Components
import Sidebar from "@/components/layout/Sidebar";
import Card from "@/components/ui/Card";

// Pages
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
import SetIncentivePage from "./SetIncentivePage";
import RewardPage from "./RewardPage";
import logo from "../../assets/logo.png";

const AdminDashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);

  const renderSection = () => {
    switch (activeSection) {
      case "outlets":
        return <OutletManager key={refreshKey} />;
      case "pending":
        return <PendingSalesmen key={refreshKey} />;
      case "users":
        return <UserManager key={refreshKey} />;
      case "upload":
        return <BaseUpload key={refreshKey} />;
      case "products":
        return <ProductManager key={refreshKey} />;
      case "sales":
        return <SalesUpload key={refreshKey} />;
      case "claims":
        return <ClaimDashboard key={refreshKey} />;
      case "incentives":
        return <IncentiveControl key={refreshKey} />;
      case "streaks":
        return <Streaks key={refreshKey} />;
      case "leaderboard":
        return <Leaderboard key={refreshKey} />;
      case "traits":
        return <TraitsConfig key={refreshKey} />;
      case "setup":
        return <SetupPanel key={refreshKey} />;
      case "setincentives":
        return <SetIncentivePage key={refreshKey} />;
      case "reward":
        return <RewardPage key={refreshKey} />;
      default:
        return (
          <div style={{ fontSize: "1.25rem", fontWeight: "bold", color: "#444" }}>
            Welcome to Admin Dashboard
          </div>
        );
    }
  };

  return (
    <div style={{ backgroundColor: "#fce4ec", minHeight: "100vh", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* 3D Header */}
      <div style={{
        width: "100%",
        background: "#ffffff",
        padding: "18px 0",
        textAlign: "center",
        boxShadow: "0 6px 20px rgba(0,0,0,0.15)"
      }}>
        <img src={logo} alt="Logo" style={{ height: "40px" }} />
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 80px)", overflow: "hidden"}}>
        
        {/* Sidebar */}
        <div style={{
          backgroundColor: "#b71c1c",
          color: "#fff",
          width: "240px",
          padding: "16px 0",
          boxShadow: "4px 0 12px rgba(0,0,0,0.1)"
        }}>
          <Sidebar
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        </div>

        {/* Main Content */}
        <main style={{
          flexGrow: 1,
          padding: "32px",
          overflowY: "auto",
          background: "#fef1f4"
        }}>
          <div style={{
            maxWidth: "1000px",
            margin: "0 auto",
            background: "#fff",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
          }}>
            <h1 style={{
              fontSize: "20px",
              fontWeight: "bold",
              marginBottom: "20px",
              color: "#c62828",
              borderBottom: "2px solid #f8bbd0",
              paddingBottom: "8px"
            }}>
              {activeSection.toUpperCase()}
            </h1>
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
