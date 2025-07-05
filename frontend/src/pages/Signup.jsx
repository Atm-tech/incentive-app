import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../components/ui/Button";
import API_BASE_URL from "../config";
import logo from "../assets/logo.png";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    outlet: "",
    verticle: "",
    password: "",
  });

  const [outlets, setOutlets] = useState([]);
  const [verticles, setVerticles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [outletRes, verticleRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/public/public/outlets`),
          axios.get(`${API_BASE_URL}/api/public/public/verticles`),
        ]);
        setOutlets(outletRes.data);
        setVerticles(verticleRes.data);
      } catch (err) {
        console.error("Error loading dropdowns", err);
        alert("Failed to load outlet or verticle list.");
      }
    };
    fetchInitialData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/api/auth/signup`, formData);
      alert("Signup successful! Please wait for admin approval.");
      navigate("/login");
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      alert(err.response?.data?.detail || "Signup failed.");
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

      {/* ✅ Signup Form */}
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "30px 16px",
        minHeight: "calc(100vh - 60px)",
        background: "#ffffff"
      }}>
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#fff",
            padding: "32px",
            borderRadius: "12px",
            boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
            maxWidth: "420px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h2 style={{ textAlign: "center", fontSize: "22px", fontWeight: "bold" }}>
            Create Your Account
          </h2>

          {[
            { label: "Full Name", name: "name" },
            { label: "Mobile", name: "mobile" },
            { label: "Password", name: "password", type: "password" },
          ].map(({ label, name, type = "text" }) => (
            <div key={name}>
              <label style={{ display: "block", fontSize: "14px", marginBottom: "4px" }}>{label}</label>
              <input
                type={type}
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  border: "1px solid #ccc",
                  padding: "10px",
                  borderRadius: "6px",
                  fontSize: "14px"
                }}
              />
            </div>
          ))}

          <div>
            <label style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>Select Outlet</label>
            <select
              name="outlet"
              value={formData.outlet}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                border: "1px solid #ccc",
                padding: "10px",
                borderRadius: "6px",
                fontSize: "14px"
              }}
            >
              <option value="">-- Select an outlet --</option>
              {outlets.map((o) => (
                <option key={o.id} value={o.name}>{o.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>Select Verticle</label>
            <select
              name="verticle"
              value={formData.verticle}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                border: "1px solid #ccc",
                padding: "10px",
                borderRadius: "6px",
                fontSize: "14px"
              }}
            >
              <option value="">-- Select a verticle --</option>
              {verticles.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div style={{ textAlign: "center" }}>
            <Button type="submit">Sign Up</Button>
          </div>

          <p style={{ textAlign: "center", fontSize: "14px" }}>
            Already a member?{" "}
            <span
              onClick={() => navigate("/login")}
              style={{
                color: "#007bff",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Login here
            </span>
          </p>
        </form>
      </div>
    </div>
  );
}
