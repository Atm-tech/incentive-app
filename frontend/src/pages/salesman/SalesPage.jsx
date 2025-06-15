import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import api from '../../lib/api';

export default function SalesPage() {
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState({ name: '', phone: '' });
  const [manualBarcode, setManualBarcode] = useState('');
  const navigate = useNavigate();

  // 🔐 Token Guard
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return navigate('/login');
    try {
      jwtDecode(token);
    } catch {
      localStorage.removeItem('access_token');
      navigate('/login');
    }
  }, []);

  // ➕ Manual Barcode Entry
  const handleManualEntry = async (code) => {
    if (!code) return;
    try {
      const { price, traitPercentage } = await api.get(`/api/products/${code}`).then(r => r.data);
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
      alert("Product not found");
    }
  };

  const updateQty = (idx, qty) => {
    setItems(items.map((item, i) => (i === idx ? { ...item, qty } : item)));
  };

  const total = items.reduce(
    (sum, { price, qty, traitPercentage }) =>
      sum + price * qty * (traitPercentage / 100),
    0
  );

  const submitSale = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const decoded = jwtDecode(token);
      const salesman_id = decoded.id;

      await api.post('/api/sales/submit', {
        items: items.map(({ barcode, qty }) => ({ barcode, qty })),
        customer_name: customer.name,
        customer_number: customer.phone,
        salesman_id
      });

      navigate('/salesman');
    } catch (err) {
      alert('Failed to submit sale');
      console.error(err);
    }
  };

  return (
    <div className="p-4 bg-pink-100 min-h-screen">
      {/* 🔻 Header */}
      <header className="bg-red-600 p-3 flex items-center justify-center relative">
        <Card
          className="w-10 h-10 absolute left-4 bg-gray-200 cursor-pointer"
          onClick={() => navigate(-1)}
        />
        <h1 className="text-white text-lg">SALES PAGE</h1>
      </header>

      {/* ➕ Manual Entry */}
      <Card className="mt-6 p-4 flex flex-col items-center space-y-2">
        <Input
          label="Manual Barcode"
          placeholder="Enter barcode"
          value={manualBarcode}
          onChange={(e) => setManualBarcode(e.target.value)}
          className="w-full"
        />
        <Button onClick={() => handleManualEntry(manualBarcode)}>➕ Add</Button>
      </Card>

      {/* 🧾 Scanned List */}
      <Card className="mt-4 overflow-x-auto text-center p-4">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th>SNO</th><th>BARCODE</th><th>QTY</th><th>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{item.barcode}</td>
                <td>
                  <Input
                    type="number"
                    value={item.qty}
                    onChange={(e) => updateQty(i, +e.target.value)}
                    className="w-16"
                  />
                </td>
                <td>{(item.price * item.qty * (item.traitPercentage / 100)).toFixed(2)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan="3" className="text-right font-bold">TOTAL</td>
              <td className="font-bold">{total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </Card>

      {/* 🧑 Customer Info */}
      <Card className="mt-4 p-4 text-center">
        <p className="font-semibold mb-2">CUSTOMER DETAILS</p>
        <Input
          label="Name"
          value={customer.name}
          onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
        />
        <Input
          label="Phone"
          value={customer.phone}
          onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
        />
      </Card>

      {/* ✅ Submit */}
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
