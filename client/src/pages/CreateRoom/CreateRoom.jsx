import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateRoom.scss';

const API = 'http://localhost:5000';

const CreateRoom = () => {
  const [name, setName] = useState('NPL Auction 2025');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('npl_token');
      const res = await axios.post(`${API}/api/rooms/create`, { name, is_public: true, purse_per_team: 120, timer_seconds: 30, max_teams: 4, rtm_cards: 2, team_assignment: 'CHOICE' }, { headers: { Authorization: `Bearer ${token}` } });
      // Reset auction state for fresh start
      await axios.post(`${API}/api/auction/reset`);
      // Go DIRECTLY to the auctioneer dashboard
      navigate(`/room/${res.data.room.code}/auctioneer`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create room');
    }
  };

  return (
    <div className="create-room-page">
      <div className="config-card">
        <h2>Host New Auction</h2>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleCreate}>
          <div className="form-group"><label>Room Name</label><input type="text" required value={name} onChange={e => setName(e.target.value)} /></div>
          <button type="submit" className="btn-primary create-submit">🏏 Create & Start Auction</button>
        </form>
      </div>
    </div>
  );
};

export default CreateRoom;
