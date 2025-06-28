import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";
import { toLocalTime } from "../../utils/formatDate";

export default function IncentiveControl() {
  const [incentives, setIncentives] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [sortBy, setSortBy] = useState("date_desc");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [outlet, setOutlet] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentData = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    fetchIncentives();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [incentives, fromDate, toDate, sortBy, outlet]);

  const fetchIncentives = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/incentives`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIncentives(res.data);
    } catch (err) {
      console.error("Error loading incentives", err);
      alert("Could not load incentives.");
    }
  };

  const toggleVisibility = async (id, currentState) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${API_BASE_URL}/api/incentives/${id}/visibility`,
        { is_visible: !currentState },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIncentives((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, is_visible: !currentState } : item
        )
      );
    } catch (err) {
      console.error("Error toggling visibility", err);
      alert("Could not update visibility.");
    }
  };

  const applyFilters = () => {
    let data = [...incentives];

    if (fromDate) {
      data = data.filter((i) => new Date(i.timestamp) >= new Date(fromDate));
    }
    if (toDate) {
      data = data.filter((i) => new Date(i.timestamp) <= new Date(toDate));
    }
    if (outlet.trim()) {
      data = data.filter((i) =>
        i.salesman_name?.toLowerCase().includes(outlet.trim().toLowerCase())
      );
    }

    if (sortBy === "date_asc") {
      data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } else if (sortBy === "date_desc") {
      data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } else if (sortBy === "amount") {
      data.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === "outlet") {
      data.sort((a, b) =>
        (a.salesman_name || "").localeCompare(b.salesman_name || "")
      );
    }

    setFiltered(data);
    setCurrentPage(1);
  };

  const downloadCSV = () => {
    const dataToExport = filtered.map((i) => [
      `"${i.salesman_name || "N/A"}"`,
      `"${i.barcode}"`,
      `"${i.trait}"`,
      `"${i.amount}"`,
      `"${toLocalTime(i.timestamp).toLocaleString()}"`,
      `"${i.is_visible ? "Yes" : "No"}"`,
    ]);

    const csvContent = [
      ["Salesman", "Barcode", "Trait", "Amount", "Timestamp", "Visible"],
      ...dataToExport,
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "incentives_filtered.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-4">🎯 Incentive Control Panel</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border p-1 text-sm"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border p-1 text-sm"
        />
        <input
          type="text"
          placeholder="Outlet/Salesman"
          value={outlet}
          onChange={(e) => setOutlet(e.target.value)}
          className="border p-1 text-sm"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border p-1 text-sm"
        >
          <option value="date_desc">Date ↓</option>
          <option value="date_asc">Date ↑</option>
          <option value="amount">Amount ↓</option>
          <option value="outlet">Outlet A–Z</option>
        </select>
        <button
          onClick={downloadCSV}
          className="text-sm px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700"
        >
          ⬇️ Download CSV
        </button>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p className="text-gray-500">No incentives match the filters.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border text-sm">
              <thead>
                <tr className="bg-gray-200 text-left">
                  <th className="px-3 py-2">Salesman</th>
                  <th className="px-3 py-2">Barcode</th>
                  <th className="px-3 py-2">Trait</th>
                  <th className="px-3 py-2">Amount</th>
                  <th className="px-3 py-2">Timestamp</th>
                  <th className="px-3 py-2">Visible</th>
                  <th className="px-3 py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentData.map((i) => (
                  <tr
                    key={i.id}
                    className={`border-t ${
                      i.is_visible ? "bg-green-50" : "bg-red-50"
                    }`}
                  >
                    <td className="px-3 py-1">{i.salesman_name || "N/A"}</td>
                    <td className="px-3 py-1">{i.barcode}</td>
                    <td className="px-3 py-1">{i.trait}</td>
                    <td className="px-3 py-1">₹{i.amount}</td>
                    <td className="px-3 py-1">
                      {toLocalTime(i.timestamp).toLocaleString()}
                    </td>
                    <td className="px-3 py-1">
                      <span
                        className={`font-semibold ${
                          i.is_visible ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {i.is_visible ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-3 py-1">
                      <button
                        onClick={() => toggleVisibility(i.id, i.is_visible)}
                        className="text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                      >
                        {i.is_visible ? "Hide" : "Unhide"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-end items-center gap-3 mt-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="text-sm px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
            >
              ◀ Prev
            </button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={currentPage === totalPages}
              className="text-sm px-3 py-1 rounded bg-gray-300 hover:bg-gray-400 disabled:opacity-50"
            >
              Next ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
}
