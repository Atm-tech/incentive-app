import { useState, useEffect } from "react";
import axios from "axios";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import API_BASE_URL from "../../config";

export default function OutletManager() {
  const [outletName, setOutletName] = useState("");
  const [outlets, setOutlets] = useState([]);

  const fetchOutlets = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/admin/outlets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOutlets(res.data);
    } catch (err) {
      console.error("Failed to load outlets", err);
    }
  };

  const handleCreateOutlet = async () => {
    if (!outletName.trim()) return alert("Outlet name cannot be empty.");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/admin/outlets`,
        { name: outletName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOutletName("");
      fetchOutlets();
    } catch (err) {
      console.error("Outlet creation failed", err);
      alert("Could not create outlet");
    }
  };

  useEffect(() => {
    fetchOutlets();
  }, []);

  return (
    <section className="border p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-4">📍 Outlet Management</h2>
      <div className="flex items-center space-x-2 mb-4">
        <Input
          name="outlet"
          value={outletName}
          onChange={(e) => setOutletName(e.target.value)}
          placeholder="Enter outlet name"
        />
        <Button onClick={handleCreateOutlet}>Create</Button>
      </div>
      <ul className="list-disc ml-5 text-sm">
        {outlets.map((o) => (
          <li key={o.id}>{o.name}</li>
        ))}
      </ul>
    </section>
  );
}
