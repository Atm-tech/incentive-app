import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BarcodeScanner from 'react-qr-barcode-scanner';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../lib/api';

export default function SalesPage() {
  const [scanning, setScanning] = useState(true);
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const navigate = useNavigate();

  const onDetected = useCallback(async (code) => {
    if (!code) return;
    setScanning(false);

    try {
      const { price, traitPercentage } = await api.get(`/products/${code}`)
        .then(r => r.data);

      setItems(prev => [
        ...prev,
        { barcode: code, qty: 1, price, traitPercentage }
      ]);
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(true);
    }
  }, []);

  const updateQty = (idx, qty) => {
    setItems(items.map((it, i) => i === idx ? { ...it, qty } : it));
  };

  const total = items.reduce(
    (sum, { price, qty, traitPercentage }) =>
      sum + price * qty * (traitPercentage / 100),
    0
  );

  const submitSale = async () => {
    await api.post('/sales', {
      items: items.map(({ barcode, qty, price, traitPercentage }) => ({
        barcode, qty, price, traitPercentage
      })),
      customer
    });
    navigate('/salesman');
  };

  return (
    <div className="p-4 bg-pink-100 min-h-screen">
      <header className="bg-red-600 p-3 flex items-center">
        <Card
          className="w-10 h-10 mr-2 bg-gray-200 cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <h1 className="text-white text-lg">SALES PAGE</h1>
      </header>

      <div className="mt-4">
        {scanning && (
          <BarcodeScanner
            width={300}
            height={200}
            onUpdate={(err, result) => {
              if (result) onDetected(result.text);
            }}
          />
        )}
      </div>

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
                    onChange={e => updateQty(i, +e.target.value)}
                    className="w-16"
                  />
                </td>
                <td>
                  {(it.price * it.qty * (it.traitPercentage / 100)).toFixed(2)}
                </td>
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
          onChange={e => setCustomer({ ...customer, name: e.target.value })}
        />
        <Input
          label="Number"
          value={customer.phone}
          onChange={e => setCustomer({ ...customer, phone: e.target.value })}
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
