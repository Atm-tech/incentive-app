import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { toLocalTime } from '../../utils/formatDate';
import logo from '../../assets/logo.png';

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/claim/summary', {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => setHistory(res.data.history || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* ✅ Full-width Header */}
      <div style={{
        width: "100vw",
        background: "#e60000",
        padding: "12px 0",
        textAlign: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        marginLeft: "-8px",
        marginRight: "-8px"
      }}>
        <img src={logo} alt="Logo" style={{ height: "40px" }} />
      </div>

      <div style={{ padding: "20px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            backgroundColor: "#e60000",
            color: "#fff",
            padding: "8px 16px",
            fontSize: "14px",
            border: "none",
            borderRadius: "999px",
            fontWeight: "bold",
            marginBottom: "20px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            cursor: "pointer"
          }}
        >
          ← Back
        </button>

        <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px", textDecoration: "underline" }}>
          All Withdrawal History
        </h2>

        {loading ? (
          <p style={{ color: "#555" }}>Loading...</p>
        ) : history.length === 0 ? (
          <p style={{ color: "#999" }}>No withdrawal history found.</p>
        ) : (
          <div style={{
            overflowX: "auto",
            backgroundColor: "#fff",
            borderRadius: "12px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          }}>
            <table style={{
              width: "100%",
              fontSize: "14px",
              borderCollapse: "collapse",
              border: "1px solid #ddd"
            }}>
              <thead style={{ backgroundColor: "#f3f3f3" }}>
                <tr>
                  <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ccc" }}>Amount</th>
                  <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ccc" }}>Status</th>
                  <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ccc" }}>Date</th>
                  <th style={{ padding: "10px", textAlign: "left", borderBottom: "1px solid #ccc" }}>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "10px" }}>₹{item.amount}</td>
                    <td style={{ padding: "10px" }}>{item.status.toUpperCase()}</td>
                    <td style={{ padding: "10px", color: "#555" }}>
                      {toLocalTime(item.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: "10px", color: "#e60000" }}>{item.remarks || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
