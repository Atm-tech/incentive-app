import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function SetupPanel() {
  const [setupComplete, setSetupComplete] = useState(null);
  const [outletName, setOutletName] = useState("");
  const [verticleName, setVerticleName] = useState("");
  const [verticleDesc, setVerticleDesc] = useState("");
  const [outlets, setOutlets] = useState([]);
  const [verticles, setVerticles] = useState([]);

  const token = localStorage.getItem("token");

  useEffect(() => {
    checkSetupStatus();
    fetchOutlets();
    fetchVerticles();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/setup/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSetupComplete(res.data.setup_complete);
    } catch (err) {
      console.error("Failed to check setup status", err);
    }
  };

  const fetchOutlets = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/outlets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOutlets(res.data);
    } catch (err) {
      console.error("Failed to fetch outlets", err);
    }
  };

  const fetchVerticles = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/verticles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVerticles(res.data);
    } catch (err) {
      console.error("Failed to fetch verticles", err);
    }
  };

  const handleAddOutlet = async () => {
    if (!outletName.trim()) return alert("Enter outlet name.");
    try {
      await axios.post(
        `${API_BASE_URL}/api/admin/outlets`,
        { name: outletName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOutletName("");
      fetchOutlets();
    } catch (err) {
      console.error("Outlet creation failed", err);
    }
  };

  const handleAddVerticle = async () => {
    if (!verticleName.trim()) return alert("Enter verticle name.");
    const exists = verticles.some(
      (v) => v.name.toLowerCase() === verticleName.trim().toLowerCase()
    );
    if (exists) return alert("A verticle with this name already exists.");

    try {
      await axios.post(
        `${API_BASE_URL}/api/admin/verticles`,
        { name: verticleName.trim(), description: verticleDesc.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setVerticleName("");
      setVerticleDesc("");
      fetchVerticles();
    } catch (err) {
      console.error("Verticle creation failed", err);
    }
  };

  const handleEditVerticle = async (id, currentName, currentDesc) => {
    const newName = prompt("Edit verticle name:", currentName);
    if (!newName || newName.trim() === "") return;

    const duplicate = verticles.some(
      (v) => v.name.toLowerCase() === newName.toLowerCase() && v.id !== id
    );
    if (duplicate) return alert("A verticle with this name already exists.");

    const newDesc = prompt("Edit description:", currentDesc || "");

    try {
      await axios.put(
        `${API_BASE_URL}/api/admin/verticles/${id}`,
        { name: newName.trim(), description: newDesc.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      fetchVerticles();
    } catch (err) {
      console.error("Verticle update failed", err);
    }
  };

  const handleDeleteVerticle = async (id) => {
    if (!window.confirm("Are you sure you want to delete this verticle?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/verticles/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVerticles();
    } catch (err) {
      console.error("Verticle deletion failed", err);
    }
  };

  const markSetupDone = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/admin/setup/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSetupComplete(true);
      alert("Setup complete.");
    } catch (err) {
      console.error("Failed to mark setup complete", err);
    }
  };

  if (setupComplete) return null;

  return (
    <div className="border rounded-lg p-6 shadow bg-white space-y-8">
      <h2 className="text-xl font-bold text-red-700">🔧 Initial Setup</h2>

      {/* Outlets */}
      <div>
        <h3 className="font-semibold text-lg mb-2">📍 Add Outlets</h3>
        <div className="flex gap-2 flex-wrap">
          <Input
            placeholder="Enter outlet name"
            value={outletName}
            onChange={(e) => setOutletName(e.target.value)}
          />
          <Button onClick={handleAddOutlet}>Add</Button>
        </div>
        <ul className="mt-3 text-sm list-disc ml-6 text-gray-700">
          {outlets.map((o) => (
            <li key={o.id}>{o.name}</li>
          ))}
        </ul>
      </div>

      {/* Verticles */}
      <div>
        <h3 className="font-semibold text-lg mb-2">📦 Add Verticles</h3>
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Verticle name"
            value={verticleName}
            onChange={(e) => setVerticleName(e.target.value)}
          />
          <Input
            placeholder="Description (optional)"
            value={verticleDesc}
            onChange={(e) => setVerticleDesc(e.target.value)}
          />
          <Button onClick={handleAddVerticle}>Add</Button>
        </div>
        <ul className="mt-3 text-sm space-y-2">
          {verticles.map((v) => (
            <li
              key={v.id}
              className="flex justify-between items-center border-b pb-1"
            >
              <span>
                <strong>{v.name}</strong>
                {v.description && ` – ${v.description}`}
              </span>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => handleEditVerticle(v.id, v.name, v.description)}>
                  ✏️
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDeleteVerticle(v.id)}
                >
                  ❌
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Final Setup Completion */}
      <div className="pt-6">
        <Button onClick={markSetupDone} full className="bg-green-600 text-white py-2 rounded">
          ✅ Mark Setup Complete
        </Button>
      </div>
    </div>
  );
}
