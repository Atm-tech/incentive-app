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
    api.get('/salesman/stats')
      .then(res => setStats(res.data))
      .catch(console.error);
  }, []);

  if (!stats) return <p>Loading…</p>;

  return (
    <div className="p-4 bg-pink-100 min-h-screen">
      <header className="bg-red-600 p-3 flex items-center">
        <Card
          className="w-10 h-10 mr-2 bg-gray-200 cursor-pointer"
          onClick={() => navigate('/salesman/profile')}
        />
        <h1 className="text-white text-lg">LANDING PAGE</h1>
      </header>

      <Card className="mt-4 p-4 flex justify-between items-center">
        <div>
          <p><strong>Total incentive</strong> {stats.totalIncentive}</p>
          <p><strong>Today's incentive</strong> {stats.todayIncentive}</p>
          <p><strong>Wallet Balance</strong> {stats.walletBalance}</p>
        </div>
        <div className="w-20 h-20 bg-gray-300 text-center flex items-center justify-center">
          PHOTO
        </div>
      </Card>

      <div className="mt-6">
        <Leaderboard data={stats.leaderboard} />
      </div>

      <div className="mt-auto text-center mb-8">
        <Button onClick={() => navigate('/salesman/sales')}>
          New sale
        </Button>
      </div>
    </div>
  );
}
