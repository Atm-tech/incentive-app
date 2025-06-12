import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import api from '../../lib/api';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/salesman/me')
      .then(res => setProfile(res.data))
      .catch(console.error);
  }, []);

  if (!profile) return <p>Loading…</p>;

  return (
    <div className="p-4 bg-pink-100 min-h-screen">
      <header className="bg-red-600 p-3 flex items-center">
        <Card className="w-10 h-10 mr-2 bg-gray-200" />
        <h1 className="text-white text-lg">PROFILE PAGE</h1>
      </header>

      <div className="mt-6 flex flex-col items-center">
        <div className="w-24 h-24 rounded-full bg-gray-300 mb-4" />
        <Card className="p-4 w-full max-w-xs">
          <p><strong>Salesman ID:</strong> {profile.id}</p>
          <p><strong>Name:</strong>       {profile.name}</p>
          <p><strong>Outlet:</strong>     {profile.outlet}</p>
          <p><strong>Verticle:</strong>   {profile.verticle}</p>
        </Card>
      </div>

      <div className="mt-auto text-center mb-8">
        <Button onClick={() => navigate('/salesman')}>
          New sale
        </Button>
      </div>
    </div>
  );
}
