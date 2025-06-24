import React, { useEffect, useState } from "react";
import api from "../../lib/api";
import { ToastContainer, toast } from "react-toastify";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "react-toastify/dist/ReactToastify.css";

export default function AdminSalesPage() {
  const [rawSales, setRawSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [search, setSearch] = useState("");
  const [outletFilter, setOutletFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activeTab, setActiveTab] = useState("total");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [outlets, setOutlets] = useState([]);

  useEffect(() => {
    api
      .get("/api/sales/admin/sales", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      .then((res) => {
        setRawSales(res.data || []);
        setOutlets([...new Set(res.data.map((s) => s.outlet))]);
      })
      .catch((err) => {
        toast.error("Failed to load sales data");
        console.error(err);
      });
  }, []);

  useEffect(() => {
    let result = [...rawSales];

    if (activeTab === "today") {
      const today = new Date().toISOString().split("T")[0];
      result = result.filter((s) => s.timestamp.startsWith(today));
    } else if (activeTab === "month") {
      const now = new Date();
      result = result.filter((s) => {
        const d = new Date(s.timestamp);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    } else if (activeTab === "last_month") {
      const now = new Date();
      const prevMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      const prevYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      result = result.filter((s) => {
        const d = new Date(s.timestamp);
        return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
      });
    }

    if (fromDate && toDate) {
      const from = new Date(fromDate);
      const to = new Date(toDate);
      result = result.filter((s) => {
        const date = new Date(s.timestamp);
        return date >= from && date <= to;
      });
    }

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (s) =>
          s.customer_name.toLowerCase().includes(term) ||
          s.customer_number.includes(term) ||
          s.barcode.includes(term)
      );
    }

    if (outletFilter) {
      result = result.filter((s) => s.outlet === outletFilter);
    }

    setFilteredSales(result);
    setCurrentPage(1);
  }, [rawSales, search, outletFilter, fromDate, toDate, activeTab]);

  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  const totalPages = Math.ceil(filteredSales.length / rowsPerPage);

  const downloadXLSX = () => {
    const rows = filteredSales.map((s) => ({
      Date: new Date(s.timestamp).toLocaleDateString(),
      Customer: s.customer_name,
      Phone: s.customer_number,
      Barcode: s.barcode,
      Qty: s.qty,
      Amount: s.amount,
      Salesman: s.salesman_name,
      Outlet: s.outlet,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sales Report");
    const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buf], { type: "application/octet-stream" }), "sales_report.xlsx");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Segoe UI, sans-serif" }}>
      <ToastContainer />
      <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#b91c1c", textAlign: "center", marginBottom: "20px", textDecoration: "underline" }}>
        All Sales Report
      </h2>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
        {["today", "month", "last_month", "total"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setFromDate("");
              setToDate("");
              setSearch("");
              setActiveTab(tab);
            }}
            style={{
              padding: "6px 16px",
              borderRadius: "999px",
              border: `1px solid ${activeTab === tab ? "#dc2626" : "#d1d5db"}`,
              backgroundColor: activeTab === tab ? "#dc2626" : "transparent",
              color: activeTab === tab ? "white" : "#374151",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            {tab === "today"
              ? "Today"
              : tab === "month"
              ? "This Month"
              : tab === "last_month"
              ? "Last Month"
              : "Total"}
          </button>
        ))}

        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #ccc" }} />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #ccc" }} />
        <input type="text" placeholder="Search name, phone, barcode" value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #ccc", minWidth: "200px" }} />
        <select value={outletFilter} onChange={(e) => setOutletFilter(e.target.value)} style={{ padding: "6px 8px", borderRadius: "6px", border: "1px solid #ccc" }}>
          <option value="">All Outlets</option>
          {outlets.map((o, i) => (
            <option key={i} value={o}>{o}</option>
          ))}
        </select>

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
          Download XLSX
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
