import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import API_BASE_URL from "../config";

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

      // Save token + role
      localStorage.setItem("token", access_token);
      localStorage.setItem("role", role);

      // Redirect based on role
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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 bg-white p-6 rounded shadow-md"
      >
        <h2 className="text-xl font-bold text-center">Login</h2>

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

        <Button type="submit" full>Login</Button>

        <p className="text-center text-sm">
          Don’t have an account?{" "}
          <span
            className="text-blue-600 cursor-pointer underline"
            onClick={() => navigate("/")}
          >
            Signup here
          </span>
        </p>
      </form>
    </div>
  );
}
