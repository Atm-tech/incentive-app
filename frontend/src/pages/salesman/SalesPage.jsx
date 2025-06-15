import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { BrowserMultiFormatReader } from '@zxing/browser';
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
  const navigate = useNavigate();

  const [scanning, setScanning] = useState(true);
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [manualBarcode, setManualBarcode] = useState('');

  useEffect(() => {
    beepSound.current = new Audio(beepAudio);
  }, []);

  useEffect(() => {
    if (!webcamRef.current || !scanning) return;

    const reader = new BrowserMultiFormatReader();
    codeReader.current = reader;

    reader.decodeFromVideoDevice(null, webcamRef.current.video, (result) => {
      if (result) {
        handleScan(result.getText());
        reader.reset();
        setTimeout(() => setScanning(true), 1500);
      }
    });

    return () => reader.reset();
  }, [scanning]);

  const handleScan = async (code) => {
    if (!code) return;
    setScanning(false);
    if (beepSound.current) beepSound.current.play();

    try {
      const { price, traitPercentage } = await api.get(`/products/${code}`).then(r => r.data);
      setItems(prev => [...prev, { barcode: code, qty: 1, price, traitPercentage }]);
    } catch {
      console.error("Product not found");
    } finally {
      setTimeout(() => setScanning(true), 1500);
    }
  };

  const handleManualEntry = async (code) => {
    if (!code) return;
    if (beepSound.current) beepSound.current.play();

    try {
      const { price, traitPercentage } = await api.get(`/products/${code}`).then(r => r.data);
      setItems(prev => [...prev, { barcode: code, qty: 1, price, traitPercentage }]);
      setManualBarcode('');
    } catch {
      alert("Product not found");
    }
  };

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Your browser doesn't support speech input");

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const spoken = event.results[0][0].transcript;
      const numeric = spoken.replace(/\D/g, '');
      handleManualEntry(numeric);
    };

    recognition.onerror = () => alert("Voice input failed");
    recognition.start();
    recognitionRef.current = recognition;
  };

  const updateQty = (i, qty) => {
    setItems(items.map((it, idx) => (i === idx ? { ...it, qty } : it)));
  };

  const total = items.reduce((sum, it) => sum + it.price * it.qty * (it.traitPercentage / 100), 0);

  const submitSale = async () => {
    await api.post('/api/sales/submit', {
      items: items.map(({ barcode, qty, price, traitPercentage }) => ({
        barcode,
        qty,
        price,
        traitPercentage
      })),
      customer
    });
    navigate('/salesman');
  };

  return (
    <div className="min-h-screen bg-pink-100 flex flex-col items-center p-4">
      <header className="bg-red-600 text-white text-center w-full py-3 font-semibold text-lg rounded">
        SALES PAGE
      </header>

      {/* Camera Panel */}
      <div className="mt-4 bg-gray-200 rounded overflow-hidden w-full max-w-sm h-64 flex items-center justify-center">
        <Webcam
          ref={webcamRef}
          className="rounded"
          videoConstraints={{
            facingMode: 'environment',
            width: 640,
            height: 480,
            advanced: [{ zoom: 3 }]
          }}
          style={{
            width: '100%',
            height: 'auto',
            transform: 'scale(1.5)',
            transformOrigin: 'center center'
          }}
        />
      </div>

      {/* Barcode Inputs */}
      <Card className="mt-4 p-3 w-full max-w-sm">
        <Input
          label="Manual Barcode"
          placeholder="Enter or speak barcode"
          value={manualBarcode}
          onChange={(e) => setManualBarcode(e.target.value)}
        />
        <div className="flex justify-center gap-2 mt-2">
          <Button onClick={() => handleManualEntry(manualBarcode)}>➕</Button>
          <Button onClick={startListening}>🎙️</Button>
        </div>
      </Card>

      {/* Items Table */}
      {items.length > 0 && (
        <Card className="mt-4 p-3 w-full max-w-sm">
          <table className="w-full text-center text-sm">
            <thead>
              <tr><th>SNO</th><th>BARCODE</th><th>QTY</th><th>AMOUNT</th></tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{it.barcode}</td>
                  <td>
                    <input
                      type="number"
                      value={it.qty}
                      onChange={(e) => updateQty(i, +e.target.value)}
                      className="w-12 border px-1 text-center"
                    />
                  </td>
                  <td>{(it.price * it.qty * (it.traitPercentage / 100)).toFixed(2)}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td colSpan="3" className="text-right">TOTAL</td>
                <td>{total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </Card>
      )}

      {/* Customer Input */}
      <Card className="mt-4 p-4 w-full max-w-sm">
        <p className="font-semibold text-center mb-2">CUSTOMER DETAILS</p>
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
      <div className="mt-6 mb-10 w-full max-w-sm">
        <button
          onClick={submitSale}
          disabled={!items.length || !customer.name || !customer.phone}
          className="bg-red-600 text-white w-full py-3 rounded-full font-bold disabled:bg-gray-300"
        >
          SUBMIT
        </button>
      </div>
    </div>
  );
}
