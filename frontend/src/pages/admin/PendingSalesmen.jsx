import { useEffect, useState } from "react";
import axios from "axios";
import Button from "../../components/ui/Button";
import API_BASE_URL from "../../config";

export default function PendingSalesmen() {
  const [pendingSalesmen, setPendingSalesmen] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const fetchPendingSalesmen = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/auth/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingSalesmen(res.data);
    } catch (err) {
      setPendingSalesmen([]);
      console.error("Failed to fetch pending signups", err);
    }
  };

  useEffect(() => {
    fetchPendingSalesmen();
  }, []);

  const handleAction = async (salesmanId, approve) => {
    setLoadingId(`${salesmanId}-${approve}`);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/auth/salesmen/${salesmanId}/approve`,
        { approve }, // <-- send as { approve: true } or { approve: false }
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPendingSalesmen();
    } catch (err) {
      alert(`Failed to ${approve ? "approve" : "deny"}`);
      console.error(`Failed to ${approve ? "approve" : "deny"} salesman`, err);
    }
    setLoadingId(null);
  };

  return (
    <section className="border p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-4">🕐 Pending Signups</h2>
      {pendingSalesmen.length === 0 ? (
        <p className="text-gray-500">No pending signups.</p>
      ) : (
        <ul className="space-y-3">
          {pendingSalesmen.map((s) => (
            <li
              key={s.id}
              className="flex justify-between items-center border p-2 rounded"
            >
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-gray-600">📞 {s.mobile}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleAction(s.id, true)}
                  disabled={loadingId === `${s.id}-true`}
                >
                  {loadingId === `${s.id}-true` ? "Approving..." : "Approve"}
                </Button>
                <Button
                  onClick={() => handleAction(s.id, false)}
                  variant="secondary"
                  disabled={loadingId === `${s.id}-false`}
                >
                  {loadingId === `${s.id}-false` ? "Denying..." : "Deny"}
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
