import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader, BarcodeFormat, DecodeHintType } from '@zxing/browser';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../lib/api';
import beepAudio from '../../assets/beep.mp3';

export default function SalesPage() {
  const webcamRef = useRef(null);
  const codeReader = useRef(null);
  const beepSound = useRef(null);
  const recognitionRef = useRef(null);

  const [scanning, setScanning] = useState(true);
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [manualBarcode, setManualBarcode] = useState('');
  const navigate = useNavigate();

  // Load beep
  useEffect(() => {
    beepSound.current = new Audio(beepAudio);
  }, []);

  // Barcode scanner setup
  useEffect(() => {
    if (!webcamRef.current || !scanning) return;

    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.CODE_128, BarcodeFormat.EAN_13, BarcodeFormat.UPC_A]);

    const reader = new BrowserMultiFormatReader(hints);
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

  const handleScan = async (code) => {
    if (!code) return;
    setScanning(false);
    if (beepSound.current) beepSound.current.play();

    try {
      const { price, traitPercentage } = await api.get(`/products/${code}`).then((r) => r.data);
      setItems((prev) => [...prev, { barcode: code, qty: 1, price, traitPercentage }]);
    } catch (e) {
      console.error("Product not found");
    } finally {
      setTimeout(() => setScanning(true), 1500);
    }
  };

  const handleManualEntry = async (code) => {
    if (!code) return;
    if (beepSound.current) beepSound.current.play();

    try {
      const { price, traitPercentage } = await api.get(`/products/${code}`).then((r) => r.data);
      setItems((prev) => [...prev, { barcode: code, qty: 1, price, traitPercentage }]);
      setManualBarcode('');
    } catch (e) {
      alert("Product not found");
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Your browser doesn't support speech input");

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; // for Hindi & English mix
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript;
      const numeric = spoken.replace(/\D/g, ''); // keep only digits
      handleManualEntry(numeric);
    };

    recognition.onerror = (e) => {
      console.error("Voice error:", e);
      alert("Voice input failed");
    };

    recognition.start();
    recognitionRef.current = recognition;
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
    await api.post('/api/sales/submit', {
      items: items.map(({ barcode, qty, price, traitPercentage }) => ({
        barcode,
        qty,
        price,
        traitPercentage,
      })),
      customer,
    });
    navigate('/salesman');
  };

  return (
    <div className="p-4 bg-pink-100 min-h-screen">
      <header className="bg-red-600 p-3 flex items-center">
        <Card className="w-10 h-10 mr-2 bg-gray-200 cursor-pointer" onClick={() => navigate(-1)} />
        <h1 className="text-white text-lg">SALES PAGE</h1>
      </header>

      <div className="mt-4 flex justify-center">
        <Webcam
          ref={webcamRef}
          width={640}
          height={480}
          videoConstraints={{ facingMode: "environment" }}
        />
      </div>

      <Card className="mt-4 p-4 flex gap-2 items-center">
        <Input
          label="Manual Barcode"
          placeholder="Enter or speak barcode"
          value={manualBarcode}
          onChange={(e) => setManualBarcode(e.target.value)}
          className="flex-1"
        />
        <Button onClick={() => handleManualEntry(manualBarcode)}>➕</Button>
        <Button onClick={startListening}>🎙️</Button>
      </Card>

      <Card className="mt-4 overflow-x-auto">
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

      <Card className="mt-4 p-4">
        <p className="font-semibold mb-2">Customer Details</p>
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

      <div className="mt-6 text-center mb-8">
        <Button
          onClick={submitSale}
          disabled={!items.length || !customer.name || !customer.phone}
        >
          SUBMIT
        </Button>
      </div>
    </div>
  );
}
