import React, { useEffect, useState } from "react";
import axios from "axios";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { toast } from "react-toastify";

const UserManager = () => {
  const [salesmen, setSalesmen] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSalesmen = async () => {
    try {
      const response = await axios.get("/salesmen");
      const data = Array.isArray(response.data) ? response.data : [];
      setSalesmen(data);
      console.log("Fetched salesmen:", data); // 🔍 optional debug log
    } catch (error) {
      console.error("Failed to fetch salesmen:", error);
      toast.error("Failed to fetch salesmen");
      setSalesmen([]); // Fallback to empty array to prevent .map errors
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this salesman?")) return;
    try {
      await axios.delete(`/salesmen/${id}`);
      toast.success("Salesman removed");
      setSalesmen((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("Failed to remove salesman:", error);
      toast.error("Failed to remove salesman");
    }
  };

  useEffect(() => {
    fetchSalesmen();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-4">Approved Salesmen</h2>
      <div className="grid gap-4">
        {salesmen.length === 0 ? (
          <div>No approved salesmen found.</div>
        ) : (
          salesmen.map((salesman) => (
            <div
              key={salesman.id}
              className="flex items-center justify-between border p-2 rounded"
            >
              <div>
                <div className="font-semibold">{salesman.name}</div>
                <div className="text-sm text-gray-600">
                  {salesman.mobile} — {salesman.outlet}
                </div>
              </div>
              <Button variant="destructive" onClick={() => handleDelete(salesman.id)}>
                Remove
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default UserManager;
