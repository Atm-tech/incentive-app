import React, { useEffect, useState } from "react";
import axios from "axios";
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
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const fetchSalesmen = async (period = "total") => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/salesman/summary?period=${period}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = Array.isArray(res.data) ? res.data : [];
      setSalesmen(data);
      setFilteredSalesmen(data);
      setOutlets([...new Set(data.map(s => s.outlet))]);
    } catch (err) {
      toast.error("Failed to fetch salesmen");
      setSalesmen([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesmenByDate = async () => {
    if (!fromDate || !toDate) return toast.error("Select both dates");
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/salesman/summary?from=${fromDate}&to=${toDate}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setSalesmen(res.data);
      setFilteredSalesmen(res.data);
      setActiveTab("");
    } catch {
      toast.error("Date range fetch failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadXLSX = async () => {
    try {
      const url = fromDate && toDate
        ? `${API_BASE_URL}/api/salesman/summary/xlsx?from=${fromDate}&to=${toDate}`
        : `${API_BASE_URL}/api/salesman/summary/xlsx?period=${activeTab}`;
      const res = await axios.get(url, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const blob = new Blob([res.data]);
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", "salesmen_summary.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error("Download failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this salesman?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/salesman/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      setSalesmen(prev => prev.filter(s => s.id !== id));
      toast.success("Removed");
    } catch {
      toast.error("Delete failed");
    }
  };

  const applyFiltersAndSorting = () => {
    let result = [...salesmen];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(s => s.name.toLowerCase().includes(lower) || s.mobile.includes(lower));
    }
    if (outletFilter) result = result.filter(s => s.outlet === outletFilter);
    if (statusFilter) result = result.filter(s => statusFilter === "approved" ? s.is_approved : !s.is_approved);
    result.sort((a, b) =>
      sortBy === "sales"
        ? b.total_sales - a.total_sales
        : b.total_incentive - a.total_incentive
    );
    setFilteredSalesmen(result);
    setCurrentPage(1);
  };

  useEffect(() => {
    fetchSalesmen(activeTab);
  }, [activeTab]);

  useEffect(() => {
    applyFiltersAndSorting();
  }, [searchTerm, sortBy, outletFilter, statusFilter, salesmen]);

  const paginatedSalesmen = filteredSalesmen.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(filteredSalesmen.length / rowsPerPage);

  return (
    <div style={{
      padding: "1.5rem",
      borderRadius: "12px",
      background: "#fff",
      boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      fontFamily: "'Segoe UI', sans-serif",
      overflowX: "auto"
    }}>
      <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "1rem" }}>Salesmen Summary</h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
        {tabs.map(tab => (
          <button
            key={tab.value}
            onClick={() => {
              setFromDate(""); setToDate("");
              setSearchTerm("");
              setActiveTab(tab.value);
            }}
            style={{
              padding: "6px 16px",
              borderRadius: "999px",
              border: `1px solid ${activeTab === tab.value ? "#dc2626" : "#d1d5db"}`,
              backgroundColor: activeTab === tab.value ? "#dc2626" : "transparent",
              color: activeTab === tab.value ? "white" : "#374151",
              fontSize: "14px",
              cursor: "pointer"
            }}
          >
            {tab.label}
          </button>
        ))}

        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
          style={{ padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
          style={{ padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "6px" }} />
        <button onClick={fetchSalesmenByDate}
          style={{ padding: "6px 12px", borderRadius: "6px", backgroundColor: "#10b981", color: "white", border: "none" }}>
          Apply
        </button>

        <input type="text" placeholder="Search name or mobile" value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "6px", width: "200px" }} />

        <select value={outletFilter} onChange={(e) => setOutletFilter(e.target.value)}
          style={{ padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "6px" }}>
          <option value="">All Outlets</option>
          {outlets.map((outlet, i) => <option key={i} value={outlet}>{outlet}</option>)}
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "6px" }}>
          <option value="">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          style={{ padding: "6px 8px", border: "1px solid #d1d5db", borderRadius: "6px" }}>
          <option value="sales">Sort by Sales</option>
          <option value="incentive">Sort by Incentive</option>
        </select>

        <button onClick={downloadXLSX}
          style={{
            marginLeft: "auto",
            padding: "8px 16px",
            backgroundColor: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 500,
            cursor: "pointer"
          }}>
          Download XLSX
        </button>
      </div>

      {loading ? <div>Loading...</div> : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb", textAlign: "left" }}>
                {["Name", "Mobile", "Outlet", "Sales (₹)", "Incentive", "Claimed", "Wallet", "Actions"].map(h => (
                  <th key={h} style={{ padding: "10px", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedSalesmen.map((s, i) => (
                <tr key={s.id} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f9f9f9", borderTop: "1px solid #eee" }}>
                  <td style={{ padding: "10px" }}>{s.name}</td>
                  <td style={{ padding: "10px" }}>{s.mobile}</td>
                  <td style={{ padding: "10px" }}>{s.outlet}</td>
                  <td style={{ padding: "10px" }}>₹{s.total_sales}</td>
                  <td style={{ padding: "10px" }}>₹{parseFloat(s.total_incentive || 0).toFixed(2)}</td>
                  <td style={{ padding: "10px" }}>₹{s.total_claimed}</td>
                  <td style={{ padding: "10px" }}>₹{s.wallet_balance}</td>
                  <td style={{ padding: "10px" }}>
                    <button onClick={() => handleDelete(s.id)}
                      style={{ backgroundColor: "#ef4444", color: "white", padding: "6px 10px", borderRadius: "6px", border: "none" }}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", fontSize: "14px" }}>
            <div>Showing {paginatedSalesmen.length} of {filteredSalesmen.length} salesmen</div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}
                style={{
                  padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: "6px",
                  backgroundColor: "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer"
                }}>Prev</button>
              <span>Page {currentPage} of {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}
                style={{
                  padding: "6px 12px", border: "1px solid #d1d5db", borderRadius: "6px",
                  backgroundColor: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer"
                }}>Next</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserManager;
