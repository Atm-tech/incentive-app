// ⬅️ your existing imports
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../lib/api';
import logo from "../../assets/logo.png";
import beepSound from "../../assets/beep.mp3";
import { ToastContainer, toast } from 'react-toastify';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import 'react-toastify/dist/ReactToastify.css';

export default function SalesPage() {
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [manualBarcode, setManualBarcode] = useState('');
  const [traits, setTraits] = useState([]);
  const [showPopup, setShowPopup] = useState(true);
  const scannerRef = useRef(null);
  const beepRef = useRef(null);
  const navigate = useNavigate();
  const lastScanned = useRef("");
  const lastScannedAt = useRef(0);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("token");
      if (!raw) throw new Error("No token");
      jwtDecode(raw);
    } catch {
      localStorage.removeItem("token");
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    let html5QrCode;
    let videoTrack;

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        if (!devices.length) throw new Error("No camera found");
        const rearCam = devices.find(d => d.label.toLowerCase().includes("back")) || devices[0];

        const constraints = {
          video: {
            deviceId: rearCam.id,
            facingMode: { ideal: "environment" },
            width: { ideal: 200 },
            height: { ideal: 50 }
          }
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoTrack = stream.getVideoTracks()[0];

        const capabilities = videoTrack.getCapabilities();
        if (capabilities.zoom) {
          const zoom = Math.min(capabilities.zoom.max, 2.5);
          await videoTrack.applyConstraints({ advanced: [{ zoom }] });
        }

        html5QrCode = new Html5Qrcode("reader", {
          formatsToSupport: [
            Html5QrcodeSupportedFormats.CODE_128,
            Html5QrcodeSupportedFormats.EAN_13,
            Html5QrcodeSupportedFormats.EAN_8,
            Html5QrcodeSupportedFormats.UPC_A,
            Html5QrcodeSupportedFormats.UPC_E,
          ]
        });

        await html5QrCode.start(
          { deviceId: { exact: rearCam.id } },
          {
            fps: 10,
            qrbox: { width: 300, height: 50 },
            videoConstraints: { deviceId: rearCam.id }
          },
          async (decodedText) => {
            const now = Date.now();
            if (decodedText === lastScanned.current && now - lastScannedAt.current < 2000) return;
            lastScanned.current = decodedText;
            lastScannedAt.current = now;
            try { await beepRef.current?.play(); } catch {}
            toast.success(`Scanned: ${decodedText}`);
            await handleManualEntry(decodedText);
          },
          () => {}
        );

        scannerRef.current = html5QrCode;
      } catch (err) {
        console.error("Camera init failed:", err);
        toast.error("Camera access failed. Try HTTPS or allow permissions.");
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current) scannerRef.current.stop().then(() => scannerRef.current.clear());
      if (videoTrack) videoTrack.stop();
    };
  }, []);

  useEffect(() => {
    const unlockAudio = () => {
      beepRef.current?.play().catch(() => {});
      document.removeEventListener("click", unlockAudio);
      document.removeEventListener("touchstart", unlockAudio);
    };
    document.addEventListener("click", unlockAudio);
    document.addEventListener("touchstart", unlockAudio);
  }, []);

  useEffect(() => {
    api.get("/api/admin/traits", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).then(res => {
      const visibleTraits = res.data.filter(t => t.is_visible);
      setTraits(visibleTraits);
    }).catch(console.error);
  }, []);

  const handleManualEntry = async (code) => {
    if (!code) return;
    try {
      const { price, traitPercentage } = await api
        .get(`/api/products/api/products/${code}`)
        .then((r) => r.data);

      setItems((prev) => {
        const existing = prev.find((i) => i.barcode === code);
        if (existing) {
          return prev.map((i) =>
            i.barcode === code ? { ...i, qty: i.qty + 1 } : i
          );
        }
        return [...prev, { barcode: code, qty: 1, price, traitPercentage }];
      });

      setManualBarcode('');
    } catch {
      toast.error("Product not found");
    }
  };

  const updateQty = (idx, qty) => {
    setItems(items.map((it, i) => (i === idx ? { ...it, qty } : it)));
  };

  const total = items.reduce(
    (sum, { price, qty, traitPercentage }) =>
      sum + price * qty * (traitPercentage / 100),
    0
  );

  const submitSale = async () => {
    if (!items.length) return toast.warn("Please add a barcode first.");
    if (!customer.name || !customer.phone) return toast.warn("Please fill in customer details.");

    try {
      const raw = localStorage.getItem("token");
      const decoded = jwtDecode(raw);
      const salesman_id = decoded.id;

      await api.post('/api/sales/submit', {
        items: items.map(({ barcode, qty }) => ({ barcode, qty })),
        customer_name: customer.name,
        customer_number: customer.phone,
        salesman_id
      });

      toast.success("Sale submitted!");
      navigate('/salesman');
    } catch (error) {
      toast.error("Failed to submit sale");
      console.error(error);
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fff", fontFamily: "Segoe UI, sans-serif", position: "relative" }}>
      <ToastContainer position="top-center" />
      <style>
        {`
          #reader video {
            width: 100% !important;
            max-height: 120px !important;
            object-fit: cover;
            border-radius: 8px;
          }
        `}
      </style>
      <audio ref={beepRef} src={beepSound} preload="auto" />

      {/* Popup for Trait Incentives */}
      {showPopup && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex",
          justifyContent: "center", alignItems: "center", zIndex: 9999
        }}>
          <div style={{
            backgroundColor: "#fff", borderRadius: "16px", padding: "24px",
            width: "90%", maxWidth: "400px", boxShadow: "0 0 20px rgba(0,0,0,0.3)",
            textAlign: "center"
          }}>
            <h2 style={{ marginBottom: "1rem", fontWeight: "bold", fontSize: "20px" }}>
              Incentives
            </h2>
            {traits.map((trait, i) => (
              <p key={i} style={{ fontSize: "16px", margin: "6px 0" }}>
                <strong>{trait.trait}</strong>: {trait.percentage}%
              </p>
            ))}
            <button
              onClick={() => setShowPopup(false)}
              style={{
                marginTop: "20px", padding: "10px 20px", backgroundColor: "#e60000",
                color: "#fff", border: "none", borderRadius: "8px", fontWeight: "bold",
                cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.2)"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{
        width: "100vw",
        background: "#B71C1C",
        padding: "12px 0",
        marginLeft: "-8px",
        marginRight: "-8px",
        textAlign: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        position: "relative"
      }}>
        
        <img src={logo} alt="Logo" style={{ height: "40px" }} />
      </div>
      {/* ⬅️ Back Button (like ProfilePage) */}
       <div style={{ padding: "0 20px", marginTop: "20px" }}>
          <button
            onClick={() => navigate(-1)}
              style={{
              background: "#fff",
              border: "1px solid #e60000",
              color: "#e60000",
              padding: "6px 16px",
              borderRadius: "999px",
              fontSize: "14px",
              fontWeight: "bold",
              cursor: "pointer"
           }}
           >
             ← Back
            </button>
            </div>


      {/* Scanner */}
      <Card className="p-4 mt-4 mx-4">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '8px', gap: '8px' }}>
          <h3 className="font-semibold">Scan Barcode</h3>
          <HelpCircle
            size={20}
            color="#B71C1C"
            style={{ cursor: 'pointer' }}
            onClick={() => setShowPopup(true)}
          />
        </div>
        <div id="reader" style={{
          width: "100%",
          border: "1px solid #ccc",
          borderRadius: "10px",
          overflow: "hidden",
          minHeight: "100px"
        }} />
      </Card>

      {/* Manual Input */}
      <Card className="p-4 mt-4 mx-4">
        <h3 className="font-semibold text-center mb-2">Enter Barcode Manually</h3>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            value={manualBarcode}
            placeholder="Enter barcode"
            onChange={(e) => setManualBarcode(e.target.value)}
            style={{
              flex: 1,
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "8px"
            }}
          />
          <Button onClick={() => handleManualEntry(manualBarcode)}>Add</Button>
        </div>
      </Card>

      {/* Scanned Items */}
      {items.length > 0 && (
        <Card className="p-4 mt-4 mx-4 overflow-x-auto">
          <table style={{ width: "100%", fontSize: "14px", textAlign: "center", borderCollapse: "collapse" }}>
            <thead style={{ backgroundColor: "#f0f0f0" }}>
              <tr>
                <th style={{ padding: "10px" }}>SNO</th>
                <th>BARCODE</th>
                <th>QTY</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i} style={{ borderTop: "1px solid #ddd" }}>
                  <td style={{ padding: "10px" }}>{i + 1}</td>
                  <td>{it.barcode}</td>
                  <td>
                    <Input
                      type="number"
                      value={it.qty}
                      onChange={(e) => updateQty(i, +e.target.value)}
                      className="w-16 text-center"
                    />
                  </td>
                  <td>₹{(it.price * it.qty * (it.traitPercentage / 100)).toFixed(2)}</td>
                </tr>
              ))}
              <tr style={{ borderTop: "2px solid #000", fontWeight: "bold" }}>
                <td colSpan={3} style={{ textAlign: "right", paddingRight: "12px" }}>TOTAL</td>
                <td>₹{total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </Card>
      )}

      {/* Customer Info */}
      <Card className="p-4 mt-4 mx-4 space-y-3">
        <h3 className="text-center font-bold underline mb-2">Customer Info</h3>
        <Input
          label="Name"
          value={customer.name}
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
        />
        <Input
          label="Number"
          value={customer.phone}
          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
        />
      </Card>

      {/* Submit Button */}
      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <Button
          onClick={submitSale}
          disabled={!customer.name || !customer.phone}
          className="bg-red-600 text-white py-3 px-10 rounded-full text-lg"
        >
          SUBMIT
        </Button>
      </div>
    </div>
  );
}
