import React from "react";
import api from "../../lib/api"; // use this instead of axios directly if already configured

export default function RewardPage() {
  const handleReward = async (period) => {
    try {
      const res = await api.post("/api/admin/reward", { period });
      alert(res.data?.message || `✅ Reward sent for ${period}`);
    } catch (err) {
      alert(err.response?.data?.detail || `❌ Failed for ${period}`);
    }
  };

  return (
    <div
      style={{
        padding: "24px",
        backgroundColor: "#ffe6ea",
        minHeight: "100vh",
        fontFamily: "Segoe UI, sans-serif"
      }}
    >
      <h2
        style={{
          textAlign: "center",
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "24px",
          textDecoration: "underline"
        }}
      >
        Reward Leaderboard Winners
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          alignItems: "center"
        }}
      >
        {["day", "week", "month"].map((period) => (
          <button
            key={period}
            onClick={() => handleReward(period)}
            style={{
              backgroundColor: "#e60000",
              color: "#fff",
              padding: "14px 24px",
              borderRadius: "999px",
              boxShadow: "0 6px 14px rgba(0,0,0,0.2)",
              fontSize: "18px",
              width: "280px",
              border: "none",
              cursor: "pointer"
            }}
          >
            Reward Star of the {period}
          </button>
        ))}
      </div>
    </div>
  );
}
