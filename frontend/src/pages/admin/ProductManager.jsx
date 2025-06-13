import { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function ProductManager() {
  const [file, setFile] = useState(null);
  const [manual, setManual] = useState({
    barcode: "",
    verticle: "",
    trait: "",
    rsp: "",
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!file) return alert("Please select a file first.");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/api/products/api/products/upload-file`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Upload successful: " + res.data.message);
    } catch (err) {
      alert("Upload failed");
    }
  };

  const handleManualSubmit = async () => {
    const { barcode, verticle, trait, rsp } = manual;
    if (!barcode || !verticle || !trait || !rsp) return alert("All fields required");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/api/products/api/products/add`, manual, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Product saved: " + res.data.message);
      setManual({ barcode: "", verticle: "", trait: "", rsp: "" });
    } catch (err) {
      alert("Product save failed");
    }
  };

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-lg font-bold">📦 Product Management</h2>

      {/* File Upload Section */}
      <section className="space-y-3 border p-4 rounded shadow">
        <h3 className="font-semibold">🗂 Bulk Upload (.csv/.xlsx)</h3>
        <input type="file" accept=".xlsx,.csv" onChange={handleFileChange} />
        <Button onClick={handleFileUpload}>Upload File</Button>
      </section>

      {/* Manual Add/Update */}
      <section className="space-y-3 border p-4 rounded shadow">
        <h3 className="font-semibold">✍️ Manual Entry</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Input
            placeholder="Barcode"
            value={manual.barcode}
            onChange={(e) => setManual({ ...manual, barcode: e.target.value })}
          />
          <Input
            placeholder="Verticle"
            value={manual.verticle}
            onChange={(e) => setManual({ ...manual, verticle: e.target.value })}
          />
          <Input
            placeholder="Trait"
            value={manual.trait}
            onChange={(e) => setManual({ ...manual, trait: e.target.value })}
          />
          <Input
            placeholder="RSP"
            type="number"
            value={manual.rsp}
            onChange={(e) => setManual({ ...manual, rsp: e.target.value })}
          />
        </div>
        <Button onClick={handleManualSubmit}>Save Product</Button>
      </section>
    </div>
  );
}