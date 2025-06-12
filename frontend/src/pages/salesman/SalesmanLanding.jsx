import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import api from '../../lib/api';
import Leaderboard from '../admin/Leaderboard';

export default function SalesmanLanding() {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/salesman/salesman/stats', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`
      }
    })
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  if (!stats) return <p className="text-center mt-10">Loading…</p>;

  return (
    <div className="flex flex-col min-h-screen bg-pink-50 px-3 py-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-bold text-red-700">Dashboard</h1>
        <Card
          className="w-10 h-10 bg-gray-200 flex items-center justify-center rounded-full shadow"
          onClick={() => navigate('/salesman/profile')}
        >
          <span className="text-xs text-gray-700">Me</span>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="space-y-3">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Incentive</p>
          <p className="text-xl font-semibold text-red-600">${stats.incentives_earned.toFixed(2)}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Sales</p>
          <p className="text-xl font-semibold text-green-600">{stats.sales_count}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Sales Amount</p>
          <p className="text-xl font-semibold text-blue-600">${stats.total_amount.toFixed(2)}</p>
        </Card>
      </div>

      {/* Leaderboard */}
      <div className="mt-6">
        <Leaderboard data={stats.leaderboard || []} />
      </div>

      {/* New Sale Button */}
      <div className="mt-auto pt-6 pb-3 text-center">
        <Button onClick={() => navigate('/salesman/sales')}>
          ➕ Record New Sale
        </Button>
      </div>
    </div>
  );
}
