import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { jwtDecode } from 'jwt-decode';
import { BrowserMultiFormatReader } from '@zxing/browser';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../lib/api';

export default function SalesPage() {
  const webcamRef = useRef(null);
  const codeReader = useRef(null);

  const [scanning, setScanning] = useState(true);
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [manualBarcode, setManualBarcode] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure token exists or redirect
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      jwtDecode(token); // Just to validate
    } catch (err) {
      console.error("Invalid token");
      localStorage.removeItem("access_token");
      navigate('/login');
    }
  }, []);

  const handleScan = async (code) => {
    if (!code) return;
    setScanning(false);

    try {
      const { price, traitPercentage } = await api.get(`/api/products/api/products/${code}`).then((r) => r.data);

      setItems((prev) => {
        const existing = prev.find((i) => i.barcode === code);
        if (existing) {
          return prev.map((i) =>
            i.barcode === code ? { ...i, qty: i.qty + 1 } : i
          );
        } else {
          return [...prev, { barcode: code, qty: 1, price, traitPercentage }];
        }
      });
    } catch (e) {
      console.error("Product not found");
    } finally {
      setTimeout(() => setScanning(true), 1500);
    }
  };

  useEffect(() => {
    if (!webcamRef.current || !scanning) return;

    const reader = new BrowserMultiFormatReader();
    codeReader.current = reader;

    reader.decodeFromVideoDevice(null, webcamRef.current.video, (result, err) => {
      if (result) {
        handleScan(result.getText());
        reader.reset();
        setTimeout(() => setScanning(true), 1500);
      }
    });

    return () => {
      reader.reset();
    };
  }, [scanning]);

  const handleManualEntry = async (code) => {
    if (!code) return;

    try {
      const { price, traitPercentage } = await api.get(`/api/products/api/products/${code}`).then((r) => r.data);

      setItems((prev) => {
        const existing = prev.find((i) => i.barcode === code);
        if (existing) {
          return prev.map((i) =>
            i.barcode === code ? { ...i, qty: i.qty + 1 } : i
          );
        } else {
          return [...prev, { barcode: code, qty: 1, price, traitPercentage }];
        }
      });
      setManualBarcode('');
    } catch (e) {
      alert("Product not found");
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
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return navigate('/login');

      const decoded = jwtDecode(token);
      const salesman_id = decoded.id;

      await api.post('/api/sales/submit', {
        items: items.map(({ barcode, qty }) => ({ barcode, qty })),
        customer_name: customer.name,
        customer_number: customer.phone,
        salesman_id
      });

      navigate('/salesman');
    } catch (error) {
      alert("Failed to submit sale");
      console.error(error);
    }
  };

  return (
    <div className="p-4 bg-pink-100 min-h-screen">
      <header className="bg-red-600 p-3 flex items-center justify-center relative">
        <Card
          className="w-10 h-10 absolute left-4 bg-gray-200 cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <h1 className="text-white text-lg">SALES PAGE</h1>
      </header>

      {/* Camera Panel */}
      <Card className="mt-4 p-2 bg-white shadow rounded-xl mx-auto max-w-sm">
        <div className="relative overflow-hidden rounded-lg border border-gray-300">
          <div
            style={{
              transform: 'scale(1.4)',
              transformOrigin: 'center center',
              width: '100%',
              height: '300px',
              overflow: 'hidden',
            }}
          >
            <Webcam
              ref={webcamRef}
              width={300}
              height={300}
              videoConstraints={{
                facingMode: "environment",
                advanced: [{ zoom: 3 }]
              }}
            />
          </div>
        </div>
        <p className="text-center text-xs text-gray-500 mt-1">Camera panel (3× zoom)</p>
      </Card>

      {/* Manual Entry */}
      <Card className="mt-4 p-4 flex flex-col items-center space-y-2">
        <Input
          label="Manual Barcode"
          placeholder="Enter barcode"
          value={manualBarcode}
          onChange={(e) => setManualBarcode(e.target.value)}
          className="w-full"
        />
        <div className="flex gap-2">
          <Button onClick={() => handleManualEntry(manualBarcode)}>➕</Button>
        </div>
      </Card>

      {/* Scanned Items */}
      <Card className="mt-4 overflow-x-auto text-center p-4">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>SNO</th><th>BARCODE</th><th>QTY</th><th>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{it.barcode}</td>
                <td>
                  <Input
                    type="number"
                    value={it.qty}
                    onChange={(e) => updateQty(i, +e.target.value)}
                    className="w-16"
                  />
                </td>
                <td>{(it.price * it.qty * (it.traitPercentage / 100)).toFixed(2)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="3" className="text-right font-bold">TOTAL</td>
              <td className="font-bold">{total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </Card>

      {/* Customer Info */}
      <Card className="mt-4 p-4 text-center">
        <p className="font-semibold mb-2">CUSTOMER DETAILS</p>
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

      {/* Submit */}
      <div className="mt-6 text-center mb-8">
        <Button
          onClick={submitSale}
          disabled={!items.length || !customer.name || !customer.phone}
          className="bg-red-600 text-white py-2 px-6 rounded-full"
        >
          SUBMIT
        </Button>
      </div>
    </div>
  );
}
