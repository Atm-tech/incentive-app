import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import logo from "../../assets/logo.png";
import { ScanBarcode } from 'lucide-react';
import Leaderboard from '../admin/Leaderboard';

export default function SalesmanLanding() {
  const [stats, setStats] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const navigate = useNavigate();
  const lastScrollY = useRef(0);

  useEffect(() => {
    api.get('/api/salesman/stats', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setShowStats(currentY < lastScrollY.current || currentY < 80); // show when scrolling up or near top
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!stats) {
    return <p style={{ textAlign: "center", marginTop: "2rem", color: "#555" }}>Loading…</p>;
  }

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* 🔴 Sticky Header (never collapses) */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 1002,
        background: "#B71C1C",
        padding: "12px 0",
        textAlign: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
      }}>
        <img src={logo} alt="Logo" style={{ height: "40px" }} />
      </div>

      {/* 🟢 Collapsible Stats Container */}
      <div style={{
        transition: "max-height 0.4s ease, opacity 0.4s ease, margin 0.4s ease",
        overflow: "hidden",
        maxHeight: showStats ? "500px" : "0px",
        opacity: showStats ? 1 : 0,
        margin: showStats ? "20px" : "0px"
      }}>
        <div style={{
          background: "#fff",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)"
        }}>
          <div style={{ fontSize: "15px", color: "#333", marginBottom: "16px" }}>
            <p>Month Sales: <span style={{ fontWeight: "bold" }}>₹{(stats.month_sales_amount ?? 0).toFixed(2)}</span></p>
            <p>Today's Sales: <span style={{ fontWeight: "bold" }}>₹{(stats.today_sales_amount ?? 0).toFixed(2)}</span></p>
            <p>Today's Incentive: <span style={{ color: "#28a745", fontWeight: "bold" }}>₹{(stats.today_incentive ?? 0).toFixed(2)}</span></p>
            <p>Wallet Balance: <span style={{ color: "#007bff", fontWeight: "bold" }}>₹{(stats.wallet_balance ?? 0).toFixed(2)}</span></p>
          </div>
          <div style={{ textAlign: "right" }}>
            <button
              onClick={() => navigate('/salesman/profile')}
              style={{
                background: "#e60000",
                color: "white",
                padding: "10px 20px",
                borderRadius: "999px",
                border: "none",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
              }}
            >
              PROFILE
            </button>
          </div>
        </div>
      </div>

      {/* 🟡 Sticky New Sale Button */}
      <div style={{
        position: "sticky",
        top: "64px", // just below the header
        zIndex: 1001,
        background: "#fff",
        padding: "12px 20px",
        borderBottom: "1px solid #eee",
        boxShadow: "0 4px 10px rgba(0,0,0,0.05)"
      }}>
        <button
          onClick={() => navigate('/salesman/sales')}
          style={{
            backgroundColor: "#e60000",
            color: "#fff",
            padding: "14px 24px",
            fontSize: "16px",
            borderRadius: "999px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            gap: "10px",
            boxShadow: "0 6px 14px rgba(0,0,0,0.3)",
            border: "none",
            cursor: "pointer"
          }}
        >
          <ScanBarcode size={18} />
          <span>New Sale</span>
        </button>
      </div>

      {/* 📊 Scrollable Leaderboard */}
      <div style={{ padding: "20px", background: "#f5f5f5" }}>
        <div style={{
          backgroundColor: "#fff",
          padding: "20px",
          borderRadius: "16px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)"
        }}>
          <Leaderboard data={stats.leaderboard || []} />
        </div>
      </div>
    </div>
  );
}
