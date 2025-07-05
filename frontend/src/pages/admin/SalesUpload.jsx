import { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";
import Button from "../../components/ui/Button";

export default function SalesUpload() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/api/sales-file`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      const { inserted, skipped, skipped_dates } = res.data;
      alert(`✅ Upload successful:
🟢 Inserted: ${inserted}
⚪ Skipped: ${skipped}
📅 Skipped Dates: ${skipped_dates?.join(", ") || "None"}`);
    } catch (err) {
      console.error("Upload failed", err);
      alert("❌ File upload failed. Please check your format or try again.");
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-bold">📦 Upload Sales File</h2>

      <input
        type="file"
        accept=".xlsx,.csv"
        onChange={handleFileChange}
        className="block text-sm"
      />

      <Button onClick={handleUpload}>Upload</Button>
    </div>
  );
}
