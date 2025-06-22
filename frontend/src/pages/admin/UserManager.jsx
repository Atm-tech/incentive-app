import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config";

const tabs = [
  { label: "Today", value: "today" },
  { label: "This Month", value: "month" },
  { label: "Total", value: "total" }
];

const UserManager = () => {
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("total");

  const fetchSalesmen = async (period = "total") => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/salesman/summary?period=${period}`);
      const data = Array.isArray(response.data) ? response.data : [];
      setSalesmen(data);
    } catch (error) {
      console.error("Failed to fetch salesmen summaries:", error);
      toast.error("Failed to fetch salesmen");
      setSalesmen([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this salesman?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/salesman/${id}`);
      toast.success("Salesman removed");
      setSalesmen((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to remove salesman:", error);
      toast.error("Failed to remove salesman");
    }
  };

  const downloadCSV = () => {
    const header = [
      "ID", "Name", "Mobile", "Outlet", "Sales (₹)", "Incentive", "Claimed", "Wallet"
    ];
    const rows = salesmen.map(s =>
      [
        s.id,
        s.name,
        s.mobile,
        s.outlet,
        s.total_sales,
        s.total_incentive,
        s.total_claimed,
        s.wallet_balance
      ].join(",")
    );
    const csvContent = [header.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "salesmen_summary.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    fetchSalesmen(activeTab);
  }, [activeTab]);

  return (
    <Card className="p-4 overflow-auto">
      <h2 className="text-xl font-bold mb-2">Salesmen Summary</h2>

      {/* Tabs */}
      <div className="flex gap-4 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-1 rounded-full border ${
              activeTab === tab.value
                ? "bg-red-600 text-white border-red-600"
                : "border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <div className="ml-auto">
          <Button variant="destructive" onClick={downloadCSV}>
            Download CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : salesmen.length === 0 ? (
        <div>No salesmen found.</div>
      ) : (
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Mobile</th>
              <th className="p-2">Outlet</th>
              <th className="p-2">Sales (₹)</th>
              <th className="p-2">Incentive</th>
              <th className="p-2">Claimed</th>
              <th className="p-2">Wallet</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {salesmen.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-2 font-medium">{s.name}</td>
                <td className="p-2">{s.mobile}</td>
                <td className="p-2">{s.outlet}</td>
                <td className="p-2">₹{s.total_sales}</td>
                <td className="p-2">₹{s.total_incentive}</td>
                <td className="p-2">₹{s.total_claimed}</td>
                <td className="p-2">₹{s.wallet_balance}</td>
                <td className="p-2">
                  <Button variant="destructive" onClick={() => handleDelete(s.id)}>
                    Remove
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
};

export default UserManager;
