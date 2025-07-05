import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { toLocalTime } from "../../utils/formatDate";
import logo from "../../assets/logo.png";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/api/salesman/me')
      .then(res => setProfile(res.data))
      .catch(console.error);

    api.get('/api/claim/summary', {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(res => setSummary(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async () => {
    if (!summary?.wallet_balance || summary.wallet_balance <= 0) {
      alert("No available balance to withdraw.");
      return;
    }

    try {
      await api.post("/api/claim", {
        amount: summary.wallet_balance,
        remarks: "Salesman withdrawal request"
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });

      alert("Withdrawal request submitted!");
      window.location.reload();
    } catch (err) {
      alert("Error submitting withdrawal request.");
      console.error(err);
    }
  };

  if (!profile || loading) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading…</p>;

  const last = summary?.history?.[0];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff", fontFamily: "Segoe UI, sans-serif" }}>
      
      {/* ✅ Full-width Red Header */}
      <div style={{
        width: "100vw",
        background: "#B71C1C",
        padding: "12px 0",
        marginLeft: "-8px",
        marginRight: "-8px",
        textAlign: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
      }}>
        <img src={logo} alt="Logo" style={{ height: "40px" }} />
      </div>

      <div style={{ padding: "20px" }}>
        
        {/* Profile Details */}
        <div style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "30px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        }}>
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <div style={{ width: "80px", height: "80px", background: "#ccc", borderRadius: "999px", margin: "auto" }} />
          </div>
          <p><strong>Salesman ID:</strong> {profile.id}</p>
          <p><strong>Name:</strong> {profile.name}</p>
          <p><strong>Outlet:</strong> {profile.outlet}</p>
          <p><strong>Verticle:</strong> {profile.verticle}</p>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            background: "#fff",
            border: "1px solid #e60000",
            color: "#e60000",
            padding: "6px 16px",
            borderRadius: "999px",
            fontSize: "14px",
            marginBottom: "20px"
          }}
        >
          ← Back
        </button>

        {/* Wallet Summary */}
        <div style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "30px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
        }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px", textDecoration: "underline" }}>
            Wallet Summary
          </h2>
          <p>Total Incentive: ₹{summary.total_incentive.toFixed(2)}</p>
          <p>Total Withdrawn: ₹{summary.total_withdrawn.toFixed(2)}</p>
          <p>Wallet Balance: ₹{summary.wallet_balance.toFixed(2)}</p>
          {summary.pending_claim && (
            <p style={{ color: "#d97706", fontWeight: "bold" }}>
              Pending Withdrawal: ₹{summary.pending_claim.amount} (⏳ Pending)
            </p>
          )}

          <div style={{ marginTop: "16px", display: "flex", gap: "12px" }}>
            <button
              onClick={handleWithdraw}
              style={{
                backgroundColor: "#FF0004",
                color: "#fff",
                border: "none",
                borderRadius: "999px",
                padding: "8px 16px",
                fontWeight: "bold",
                fontSize: "14px"
              }}
            >
              Withdraw Wallet
            </button>
            <button
              onClick={() => setShowHistory(true)}
              style={{
                backgroundColor: "#007bff",
                color: "#fff",
                border: "none",
                borderRadius: "999px",
                padding: "8px 16px",
                fontWeight: "bold",
                fontSize: "14px"
              }}
            >
              View History
            </button>
          </div>
        </div>

        {/* Withdrawal History Popup */}
        {showHistory && (
          <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "12px",
              maxWidth: "90%",
              width: "400px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.25)"
            }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "12px" }}>Last Withdrawal</h3>
              {!last ? (
                <p style={{ color: "#888" }}>No withdrawal history yet.</p>
              ) : (
                <table style={{ width: "100%", fontSize: "14px", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f3f3f3" }}>
                      <th style={{ textAlign: "left", padding: "8px" }}>Amount</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>Status</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>Date</th>
                      <th style={{ textAlign: "left", padding: "8px" }}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: "8px" }}>₹{last.amount}</td>
                      <td style={{ padding: "8px" }}>{last.status.toUpperCase()}</td>
                      <td style={{ padding: "8px", color: "#555" }}>
                        {toLocalTime(last.timestamp).toLocaleString()}
                      </td>
                      <td style={{ padding: "8px", color: "#e60000" }}>{last.remarks || "-"}</td>
                    </tr>
                  </tbody>
                </table>
              )}

              <div style={{ marginTop: "20px", display: "flex", justifyContent: "space-between" }}>
                <button
                  onClick={() => setShowHistory(false)}
                  style={{
                    background: "#6c757d",
                    color: "#fff",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "999px",
                    fontWeight: "bold"
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => navigate('/history')}
                  style={{
                    background: "#007bff",
                    color: "#fff",
                    border: "none",
                    padding: "8px 14px",
                    borderRadius: "999px",
                    fontWeight: "bold"
                  }}
                >
                  Show All
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
