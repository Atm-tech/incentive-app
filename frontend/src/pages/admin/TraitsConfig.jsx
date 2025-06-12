// frontend/src/pages/admin/TraitsConfig.jsx

import { useEffect, useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function TraitsConfig() {
  const [traits, setTraits] = useState([]);
  const [newTrait, setNewTrait] = useState({ name: "", percentage: "" });

  const fetchTraits = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE_URL}/api/admin/traits`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTraits(res.data);
    } catch (err) {
      console.error("Failed to fetch traits", err);
    }
  };

  useEffect(() => {
    fetchTraits();
  }, []);

  const handleCreateTrait = async () => {
    const { name, percentage } = newTrait;
    if (!name || !percentage) return alert("Both fields required");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/admin/traits`,
        {
          trait: name,
          percentage: parseFloat(percentage),
          visible: true,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNewTrait({ name: "", percentage: "" });
      fetchTraits();
    } catch (err) {
      console.error("Failed to create trait", err);
      alert("Creation failed");
    }
  };

  const handleUpdateTrait = async (trait, updates) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${API_BASE_URL}/api/admin/traits/${trait}`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTraits();
    } catch (err) {
      console.error("Update failed", err);
      alert("Update failed");
    }
  };

  const handleDeleteTrait = async (trait) => {
    if (!confirm("Delete this trait?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE_URL}/api/admin/traits/${trait}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchTraits();
    } catch (err) {
      console.error("Deletion failed", err);
      alert("Could not delete");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-4">🎯 Traits Configuration</h2>

      {/* ➕ Add New Trait */}
      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Trait Name"
          value={newTrait.name}
          onChange={(e) => setNewTrait({ ...newTrait, name: e.target.value })}
        />
        <Input
          placeholder="% Incentive"
          type="number"
          value={newTrait.percentage}
          onChange={(e) => setNewTrait({ ...newTrait, percentage: e.target.value })}
        />
        <Button onClick={handleCreateTrait}>Add</Button>
      </div>

      {/* 📋 Existing Traits */}
      <div className="grid gap-4">
        {traits.map((t) => (
          <div key={t.trait} className="border p-3 rounded flex justify-between items-center">
            <div>
              <p className="font-semibold">{t.trait}</p>
              <p className="text-sm text-gray-600">Incentive: {t.percentage}%</p>
              <p className="text-sm">
                Visibility:{" "}
                <span className={t.visible ? "text-green-600" : "text-red-500"}>
                  {t.visible ? "Visible" : "Hidden"}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  handleUpdateTrait(t.trait, { visible: !t.visible })
                }
              >
                {t.visible ? "Hide" : "Show"}
              </Button>
              <Button
                onClick={() => {
                  const newPct = prompt("Enter new %", t.percentage);
                  if (newPct !== null) {
                    handleUpdateTrait(t.trait, { percentage: parseFloat(newPct) });
                  }
                }}
              >
                Edit %
              </Button>
              <Button onClick={() => handleDeleteTrait(t.trait)} className="bg-red-600 hover:bg-red-700">
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
