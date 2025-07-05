import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";
import Input from "../../components/ui/Input";
import { toLocalTime } from "../../utils/formatDate";

export default function ClaimDashboard() {
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [amendMap, setAmendMap] = useState({});
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [view, setView] = useState("pending");
  const [showModal, setShowModal] = useState(null);
  const [modalData, setModalData] = useState({});
  const token = localStorage.getItem("token");

  const fetchClaims = async () => {
    try {
      const endpoint = view === "pending" ? "/api/claims/pending" : "/api/claims";
      const res = await axios.get(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClaims(res.data);
      setFilteredClaims(res.data);
    } catch (err) {
      console.error("Failed to load claims", err);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [view]);

  const handleAmendRemarks = async (id) => {
    const newRemarks = amendMap[id];
    if (!newRemarks?.trim()) return alert("Remarks cannot be empty.");
    try {
      await axios.patch(`${API_BASE_URL}/api/claims/${id}`, {
        new_remarks: newRemarks,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClaims();
    } catch {
      alert("Amendment failed");
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason?.trim()) return alert("Rejection reason is required.");
    try {
      await axios.post(`${API_BASE_URL}/api/claims/${id}/reject`, {
        new_remarks: reason,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchClaims();
    } catch {
      alert("Rejection failed");
    }
  };

  const handleFilter = () => {
    let filtered = [...claims];
    if (search) {
      filtered = filtered.filter(
        c =>
          c.salesman_name?.toLowerCase().includes(search.toLowerCase()) ||
          c.salesman_id.toString().includes(search)
      );
    }
    if (startDate) {
      filtered = filtered.filter(c => new Date(c.timestamp) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(c => new Date(c.timestamp) <= new Date(endDate));
    }
    setFilteredClaims(filtered);
  };

  const downloadCSV = () => {
    const rows = [
      ["ID", "Salesman", "Amount", "Status", "Remarks", "Timestamp"],
      ...filteredClaims.map(c => [
        c.id,
        c.salesman_name || `#${c.salesman_id}`,
        c.amount,
        c.status,
        c.remarks || "",
        toLocalTime(c.timestamp).toLocaleString()
      ])
    ];
    const csvContent = "data:text/csv;charset=utf-8," +
      rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", "claims_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {view === "pending" ? "Pending Claims" : "All Claims"}
        </h2>
        <div className="flex gap-2">
          <button
            style={{
              backgroundColor: "#0288d1",
              color: "white",
              padding: "6px 12px",
              borderRadius: "6px",
              fontWeight: "500"
            }}
            onClick={() => setView(view === "pending" ? "all" : "pending")}
          >
            View {view === "pending" ? "All" : "Pending"}
          </button>
          <button
            style={{
              backgroundColor: "#388e3c",
              color: "white",
              padding: "6px 12px",
              borderRadius: "6px",
              fontWeight: "500"
            }}
            onClick={downloadCSV}
          >
            ⬇️ Export CSV
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <Input placeholder="Search by name or ID" value={search} onChange={e => setSearch(e.target.value)} />
        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        <button
          style={{
            backgroundColor: "#7b1fa2",
            color: "#fff",
            padding: "6px 12px",
            borderRadius: "6px"
          }}
          onClick={handleFilter}
        >
          Filter
        </button>
      </div>

      {filteredClaims.length === 0 ? (
        <p className="text-sm text-gray-600">No claims found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded shadow bg-white text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2">ID</th>
                <th className="p-2">Salesman</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Status</th>
                <th className="p-2">Remarks</th>
                <th className="p-2">Time</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClaims.map((claim) => (
                <>
                  <tr key={claim.id} className="border-t">
                    <td className="p-2">{claim.id}</td>
                    <td className="p-2">{claim.salesman_name || `#${claim.salesman_id}`}</td>
                    <td className="p-2">₹{claim.amount}</td>
                    <td className="p-2">
                      {claim.status === "approved" ? "✅ Approved" :
                        claim.status === "rejected" ? "❌ Rejected" : "🕓 Pending"}
                    </td>
                    <td className="p-2">
                      {claim.status === "pending" ? (
                        <div className="flex gap-2 items-center">
                          <Input
                            className="w-32"
                            placeholder="Edit remarks"
                            value={amendMap[claim.id] || ""}
                            onChange={(e) =>
                              setAmendMap({ ...amendMap, [claim.id]: e.target.value })
                            }
                          />
                          <button
                            style={{
                              backgroundColor: "#1976d2",
                              color: "#fff",
                              padding: "4px 10px",
                              fontSize: "12px",
                              borderRadius: "4px"
                            }}
                            onClick={() => handleAmendRemarks(claim.id)}
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        claim.remarks || "—"
                      )}
                    </td>
                    <td className="p-2">{toLocalTime(claim.timestamp).toLocaleString()}</td>
                    <td className="p-2 space-y-1">
                      {claim.status === "pending" && (
                        <>
                          <button
                            style={{
                              backgroundColor: "#f9a825",
                              color: "#fff",
                              padding: "6px 10px",
                              fontSize: "12px",
                              borderRadius: "4px",
                              width: "100%"
                            }}
                            onClick={() => {
                              setModalData({
                                id: claim.id,
                                amount: claim.amount,
                                newAmount: claim.amount,
                                remarks: claim.remarks || ""
                              });
                              setShowModal(claim.id);
                            }}
                          >
                            Amend+Approve
                          </button>
                          <button
                            style={{
                              backgroundColor: "#c62828",
                              color: "#fff",
                              padding: "6px 10px",
                              fontSize: "12px",
                              borderRadius: "4px",
                              width: "100%"
                            }}
                            onClick={() => handleReject(claim.id)}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>

                  {showModal === claim.id && (
                    <tr key={`${claim.id}-inline`} className="bg-pink-50 border-t">
                      <td colSpan="7" className="p-4">
                        <div className="flex flex-col gap-2">
                          <div className="text-sm font-semibold">Original Amount: ₹{modalData.amount}</div>
                          <Input
                            type="number"
                            placeholder="New Amount"
                            value={modalData.newAmount}
                            onChange={(e) => setModalData({ ...modalData, newAmount: e.target.value })}
                          />
                          <Input
                            placeholder="Remarks"
                            value={modalData.remarks}
                            onChange={(e) => setModalData({ ...modalData, remarks: e.target.value })}
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              style={{
                                backgroundColor: "#e0e0e0",
                                color: "#333",
                                padding: "6px 12px",
                                borderRadius: "4px",
                                fontSize: "14px"
                              }}
                              onClick={() => setShowModal(null)}
                            >
                              Cancel
                            </button>
                            <button
                              style={{
                                backgroundColor: "#2e7d32",
                                color: "#fff",
                                padding: "6px 12px",
                                borderRadius: "4px",
                                fontSize: "14px"
                              }}
                              onClick={async () => {
                                try {
                                  await axios.patch(`${API_BASE_URL}/api/claims/${modalData.id}/amend-approve`, {
                                    new_amount: parseFloat(modalData.newAmount),
                                    new_remarks: modalData.remarks
                                  }, {
                                    headers: { Authorization: `Bearer ${token}` }
                                  });
                                  setShowModal(null);
                                  fetchClaims();
                                } catch {
                                  alert("Amend+Approve failed.");
                                }
                              }}
                            >
                              Confirm
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
