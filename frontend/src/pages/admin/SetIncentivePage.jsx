import { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";

export default function SetIncentivePage() {
  const [form, setForm] = useState({
    day_amount: "",
    week_amount: "",
    month_amount: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${API_BASE_URL}/api/incentives/admin/set-leaderboard-incentives`,
        {
          day_amount: parseFloat(form.day_amount),
          week_amount: parseFloat(form.week_amount),
          month_amount: parseFloat(form.month_amount),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Incentives updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to update incentives.");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Set Leaderboard Incentives</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Day Incentive (₹)</label>
          <input
            type="number"
            name="day_amount"
            value={form.day_amount}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Week Incentive (₹)</label>
          <input
            type="number"
            name="week_amount"
            value={form.week_amount}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Month Incentive (₹)</label>
          <input
            type="number"
            name="month_amount"
            value={form.month_amount}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded font-semibold"
        >
          Save Incentives
        </button>
      </form>
    </div>
  );
}
