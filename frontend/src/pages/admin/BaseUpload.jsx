import { useState } from "react";
import axios from "axios";
import API_BASE_URL from "../../config";
import Button from "../../components/ui/Button";

export default function BaseUpload() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file.");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_BASE_URL}/base-file`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Upload successful: " + res.data.message);
    } catch (err) {
      console.error("Base file upload failed", err);
      alert("Upload failed. Please check the file format.");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-4">Upload Base Product File</h2>

      <input
        type="file"
        accept=".xlsx,.csv"
        onChange={handleFileChange}
        className="mb-4 block text-sm"
      />
      

      <button onClick={handleUpload}>Upload Base File</button>
    </div>
  );
}
