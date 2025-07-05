import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";
import Button from "../../components/ui/Button";

export default function Streaks() {
  const [salesmanId, setSalesmanId] = useState("");
  const [streaks, setStreaks] = useState([]);
  const [error, setError] = useState("");

  const fetchStreaks = async () => {
    setError("");
    if (!salesmanId.trim()) return setError("Salesman ID required");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/streaks/${salesmanId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStreaks(res.data);
    } catch (err) {
      console.error("Error fetching streaks", err);
      setError("Failed to load streaks. Please check ID.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">🔥 Salesman Streak Tracker</h2>

      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          placeholder="Enter Salesman ID"
          value={salesmanId}
          onChange={(e) => setSalesmanId(e.target.value)}
          className="border px-3 py-2 rounded w-1/3"
        />
        <Button onClick={fetchStreaks}>Load Streaks</Button>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {streaks.length > 0 && (
        <table className="w-full text-left border mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Sale Amount</th>
            </tr>
          </thead>
          <tbody>
            {streaks.map((s, idx) => (
              <tr key={idx}>
                <td className="p-2 border">{s.date}</td>
                <td className="p-2 border">${s.total_sales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
