import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";
import API_BASE_URL from "../../config";

const tabs = [
  { label: "Today", value: "today" },
  { label: "This Month", value: "month" },
  { label: "Last Month", value: "last_month" },
  { label: "Total", value: "total" }
];

const UserManager = () => {
  const [salesmen, setSalesmen] = useState([]);
  const [filteredSalesmen, setFilteredSalesmen] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("total");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("sales");
  const [outletFilter, setOutletFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const fetchSalesmen = async (period = "total") => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/salesman/summary?period=${period}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
      const data = Array.isArray(response.data) ? response.data : [];
      setSalesmen(data);
      setFilteredSalesmen(data);
      const outletSet = new Set(data.map(s => s.outlet));
      setOutlets([...outletSet]);
    } catch (error) {
      console.error("Failed to fetch salesmen summaries:", error);
      toast.error("Failed to fetch salesmen");
      setSalesmen([]);
      setFilteredSalesmen([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this salesman?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/salesman/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });
      toast.success("Salesman removed");
      setSalesmen(prev => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to remove salesman:", error);
      toast.error("Failed to remove salesman");
    }
  };

  const applyFiltersAndSorting = () => {
    let result = [...salesmen];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(
        s => s.name.toLowerCase().includes(lower) || s.mobile.includes(lower)
      );
    }

    if (outletFilter) {
      result = result.filter(s => s.outlet === outletFilter);
    }

    if (statusFilter) {
      result = result.filter(s =>
        statusFilter === "approved" ? s.is_approved : !s.is_approved
      );
    }

    result.sort((a, b) =>
      sortBy === "sales"
        ? b.total_sales - a.total_sales
        : b.total_incentive - a.total_incentive
    );

    setFilteredSalesmen(result);
    setCurrentPage(1);
  };

  const downloadCSV = () => {
    const header = [
      "ID", "Name", "Mobile", "Outlet", "Sales (₹)", "Incentive", "Claimed", "Wallet"
    ];
    const rows = filteredSalesmen.map(s =>
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

  useEffect(() => {
    applyFiltersAndSorting();
  }, [searchTerm, sortBy, outletFilter, statusFilter, salesmen]);

  const getMonthLabel = () => {
    const now = new Date();
    if (activeTab === "month") {
      return `${now.toLocaleString("default", { month: "long" })} Summary`;
    }
    if (activeTab === "last_month") {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return `${lastMonth.toLocaleString("default", { month: "long" })} Summary`;
    }
    return null;
  };

  const paginatedSalesmen = filteredSalesmen.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filteredSalesmen.length / rowsPerPage);

  return (
    <Card className="p-4 overflow-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold">Salesmen Summary</h2>
        {getMonthLabel() && (
          <span className="text-sm text-gray-600 italic">{getMonthLabel()}</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4">
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => {
              setSearchTerm("");
              setActiveTab(tab.value);
            }}
            className={`px-4 py-1 rounded-full border ${
              activeTab === tab.value
                ? "bg-red-600 text-white border-red-600"
                : "border-gray-300 text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}

        <input
          type="text"
          placeholder="Search name or mobile"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-1 border rounded w-56 text-sm"
        />

        <select
          value={outletFilter}
          onChange={(e) => setOutletFilter(e.target.value)}
          className="border px-2 py-1 rounded text-sm"
        >
          <option value="">All Outlets</option>
          {outlets.map((outlet, i) => (
            <option key={i} value={outlet}>{outlet}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border px-2 py-1 rounded text-sm"
        >
          <option value="">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border px-2 py-1 rounded text-sm"
        >
          <option value="sales">Sort by Sales</option>
          <option value="incentive">Sort by Incentive</option>
        </select>

        <div className="ml-auto">
          <Button variant="destructive" onClick={downloadCSV}>
            Download CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : paginatedSalesmen.length === 0 ? (
        <div>No salesmen found.</div>
      ) : (
        <>
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
              {paginatedSalesmen.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-2 font-medium">{s.name}</td>
                  <td className="p-2">{s.mobile}</td>
                  <td className="p-2">{s.outlet}</td>
                  <td className="p-2">₹{s.total_sales}</td>
                  <td className="p-2">₹{s.total_incentive ? parseFloat(s.total_incentive).toFixed(2) : "0.00"}</td>
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

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4 text-sm">
            <div>
              Showing {paginatedSalesmen.length} of {filteredSalesmen.length} salesmen
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Prev
              </Button>
              <span>Page {currentPage} of {totalPages}</span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </Card>
  );
};

export default UserManager;
