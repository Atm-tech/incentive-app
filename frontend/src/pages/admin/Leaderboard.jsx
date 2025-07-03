import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState({
    day: { data: [], label: "" },
    week: { data: [], label: "" },
    month: { data: [], label: "" },
  });

  const [incentive, setIncentive] = useState({ day: 0, week: 0, month: 0 });

  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchLeaderboard = async () => {
      try {
        const [day, week, month] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/leaderboard/day`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/leaderboard/week`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_BASE_URL}/api/leaderboard/month`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setLeaderboard({
          day: { data: day.data || [], label: "" },
          week: { data: week.data.data || [], label: week.data.label || "" },
          month: { data: month.data.data || [], label: month.data.label || "" },
        });
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
        alert("Error loading leaderboard data.");
      }
    };

    const fetchIncentives = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/incentives/public/leaderboard-incentives`);
        setIncentive(res.data);
      } catch (err) {
        console.error("Failed to load incentives:", err);
        setIncentive({ day: 0, week: 0, month: 0 });
      }
    };

    fetchLeaderboard();
    fetchIncentives();
  }, []);

  const renderTable = (title, label, data, reward) => (
    <div
      style={{
        position: "relative",
        background: "#ffffff",
        borderRadius: "16px",
        padding: "24px",
        marginBottom: "32px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        transition: "transform 0.2s ease-in-out",
      }}
    >
      {/* Incentive badge */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          backgroundColor: "#e60000",
          color: "white",
          padding: "6px 14px",
          fontWeight: "bold",
          fontSize: "13px",
          borderRadius: "999px",
          boxShadow: "inset 0 -1px 2px rgba(0,0,0,0.4)",
        }}
      >
        ₹{reward}
      </div>

      {/* Title */}
      <h2 style={{ textAlign: "center", fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>
        {title}
      </h2>

      {/* Capsule label */}
      {label && (
        <div style={{ textAlign: "center", marginBottom: "16px" }}>
          <span
            style={{
              backgroundColor: "#e60000",
              color: "#fff",
              padding: "8px 20px",
              borderRadius: "999px",
              fontWeight: "bold",
              fontSize: "14px",
              boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
            }}
          >
            {label.toUpperCase()}
          </span>
        </div>
      )}

      {/* Data or fallback */}
      {data.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888", fontStyle: "italic" }}>No entries yet.</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "15px",
            textAlign: "center",
          }}
        >
          <thead>
            <tr style={{ background: "#fffff", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: "10px" }}>Name</th>
              <th style={{ padding: "10px" }}>Sales Amt</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "10px" }}>{entry.name}</td>
                <td style={{ padding: "10px" }}>₹{(entry.sales || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div
      style={{
        padding: "15px",
        backgroundColor: "#fffff",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      <h1 style={{ textAlign: "center", fontSize: "26px", fontWeight: "bold", marginBottom: "40px", textDecoration: "underline" }}>
        Leaderboard
      </h1>

      {renderTable("Star of the Day", leaderboard.day.label, leaderboard.day.data.slice(0, 1), incentive.day)}
      {renderTable("Star of the Week", leaderboard.week.label, leaderboard.week.data.slice(0, 3), incentive.week)}
      {renderTable("Star of the Month", leaderboard.month.label, leaderboard.month.data.slice(0, 3), incentive.month)}
    </div>
  );
}
