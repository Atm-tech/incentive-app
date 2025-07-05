import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import API_BASE_URL from "../config";
import logo from "../assets/logo.png";

export default function Login() {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        mobile,
        password,
      });

      const { access_token, role } = res.data;
      localStorage.setItem("token", access_token);
      localStorage.setItem("role", role);

      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/salesman");
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Login failed.");
    }
  };

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

      {/* ✅ Centered Login Form */}
      <div style={{
        height: "calc(100vh - 64px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px"
      }}>
        <form
          onSubmit={handleSubmit}
          style={{
            background: "white",
            padding: "32px",
            borderRadius: "12px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            maxWidth: "400px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h2 style={{ textAlign: "center", fontSize: "22px", fontWeight: "bold" }}>
            Login
          </h2>

          <Input
            label="Phone Number"
            name="mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <p style={{ textAlign: "center", fontSize: "14px" }}>
            Don’t have an account?{" "}
            <span
              onClick={() => navigate("/")}
              style={{
                color: "#007bff",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Signup here
            </span>
          </p>

          <div style={{ textAlign: "center" }}>
            <Button type="submit">Login</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
