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
    <div className="p-6 space-y-10">
      <h2 className="text-2xl font-bold text-gray-800">📦 Product Management</h2>

      {/* File Upload Section */}
      <section className="space-y-4 border border-gray-200 p-6 rounded-xl shadow-sm bg-white">
        <h3 className="text-lg font-semibold text-gray-700">🗂 Bulk Upload (.csv/.xlsx)</h3>
        <div className="space-y-3">
          <input
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:rounded-md file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <Button onClick={handleFileUpload}>Upload File</Button>
        </div>
      </section>

      {/* Manual Add/Update Section */}
      <section className="space-y-4 border border-gray-200 p-6 rounded-xl shadow-sm bg-white">
        <h3 className="text-lg font-semibold text-gray-700">✍️ Manual Product Entry</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
            <Input
              placeholder="Enter barcode"
              value={manual.barcode}
              onChange={(e) => setManual({ ...manual, barcode: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verticle</label>
            <Input
              placeholder="Enter verticle"
              value={manual.verticle}
              onChange={(e) => setManual({ ...manual, verticle: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trait</label>
            <Input
              placeholder="Enter trait"
              value={manual.trait}
              onChange={(e) => setManual({ ...manual, trait: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RSP</label>
            <Input
              type="number"
              placeholder="Enter RSP"
              value={manual.rsp}
              onChange={(e) => setManual({ ...manual, rsp: e.target.value })}
            />
          </div>
        </div>
        <div className="pt-4">
          <Button onClick={handleManualSubmit}>Save Product</Button>
        </div>
      </section>
    </div>
  );
}
