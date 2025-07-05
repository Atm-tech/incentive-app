import React, { useState } from "react";
import api from "../../lib/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminSalesPage() {
  const [rawSales, setRawSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [search, setSearch] = useState("");
  const [outletFilter, setOutletFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [outlets, setOutlets] = useState([]);
  const rowsPerPage = 10;

  const fetchFilteredSales = () => {
    const params = new URLSearchParams();
    if (fromDate) params.append("from_date", fromDate);
    if (toDate) params.append("to_date", toDate);
    if (search) params.append("search", search);
    if (outletFilter) params.append("outlet", outletFilter);

    api
      .get(`/api/sales/admin/sales?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        setRawSales(res.data || []);
        setFilteredSales(res.data || []);
        setOutlets([...new Set(res.data.map((s) => s.outlet))]);
        setCurrentPage(1);
      })
      .catch((err) => {
        toast.error("Failed to load sales");
        console.error(err);
      });
  };

  const downloadXLSX = () => {
    const params = new URLSearchParams();
    if (fromDate) params.append("from_date", fromDate);
    if (toDate) params.append("to_date", toDate);
    if (search) params.append("search", search);
    if (outletFilter) params.append("outlet", outletFilter);

    api
      .get(`/api/sales/admin/sales/xlsx?${params.toString()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        responseType: "blob",
      })
      .then((res) => {
        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "sales_report.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      })
      .catch((err) => {
        toast.error("Failed to download report");
        console.error(err);
      });
  };

  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(filteredSales.length / rowsPerPage);

  return (
    <div style={{ padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      <ToastContainer />
      <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#b91c1c", textAlign: "center", marginBottom: "20px", textDecoration: "underline" }}>
        All Sales Report
      </h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #ccc" }}
        />
        <input
          type="text"
          placeholder="Search name, phone, barcode"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #ccc", minWidth: "200px" }}
        />
        <select
          value={outletFilter}
          onChange={(e) => setOutletFilter(e.target.value)}
          style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #ccc" }}
        >
          <option value="">All Outlets</option>
          {outlets.map((o, i) => (
            <option key={i} value={o}>{o}</option>
          ))}
        </select>

        <button
          onClick={fetchFilteredSales}
          style={{
            padding: "6px 12px",
            backgroundColor: "#2563eb",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          🔍 Search
        </button>

        <button
          onClick={downloadXLSX}
          style={{
            marginLeft: "auto",
            padding: "6px 12px",
            backgroundColor: "#dc2626",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontWeight: "bold",
            cursor: "pointer"
          }}
        >
          📥 Download XLSX
        </button>
      </div>

      <div style={{
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        overflowX: "auto",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
        background: "#fff",
        padding: "10px"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f3f4f6" }}>
              {["Date", "Customer", "Phone", "Barcode", "Qty", "Amount", "Salesman", "Outlet"].map((h) => (
                <th key={h} style={{ padding: "10px", borderBottom: "1px solid #ddd", textAlign: "center" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedSales.map((s, i) => (
              <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                <td style={{ padding: "8px", textAlign: "center" }}>{new Date(s.timestamp).toLocaleDateString()}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>{s.customer_name}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>{s.customer_number}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>{s.barcode}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>{s.qty}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>₹{s.amount.toFixed(2)}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>{s.salesman_name}</td>
                <td style={{ padding: "8px", textAlign: "center" }}>{s.outlet}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", fontSize: "14px" }}>
        <div>Showing {paginatedSales.length} of {filteredSales.length} sales</div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            style={{
              padding: "6px 12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              backgroundColor: "#fff",
              cursor: currentPage === 1 ? "not-allowed" : "pointer"
            }}
          >
            Prev
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            style={{
              padding: "6px 12px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              backgroundColor: "#fff",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer"
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
