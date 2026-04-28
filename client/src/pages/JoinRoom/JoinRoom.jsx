import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './JoinRoom.scss';

const TEAM_OPTIONS = [
  { id: 'team1', name: 'Mumbai Indians', shortName: 'MI', color: '#004BA0' },
  { id: 'team2', name: 'Chennai Super Kings', shortName: 'CSK', color: '#F9CD05' },
  { id: 'team3', name: 'Royal Challengers', shortName: 'RCB', color: '#D61C1C' },
  { id: 'team4', name: 'Kolkata Knight Riders', shortName: 'KKR', color: '#3A225D' },
];

const JoinRoom = () => {
  const [roomCode, setRoomCode] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleJoin = (e) => {
    e.preventDefault();
    const code = roomCode.trim().toUpperCase();
    if (!code) { setError('Enter a room code'); return; }
    if (!selectedTeam) { setError('Select a team'); return; }
    // Go DIRECTLY to team manager view
    navigate(`/room/${code}/team?team=${selectedTeam}`);
  };

  return (
    <div className="join-room-page">
      <div className="join-card">
        <h2>Join Auction</h2>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleJoin}>
          <div className="form-group">
            <label>Room Code</label>
            <input type="text" placeholder="e.g. NPL-BV8T" value={roomCode} onChange={e => setRoomCode(e.target.value)} required autoFocus />
          </div>
          <div className="form-group">
            <label>Pick Your Team</label>
            <div className="team-picker">
              {TEAM_OPTIONS.map(t => (
                <div key={t.id} className={`pick-card ${selectedTeam === t.id ? 'picked' : ''}`} onClick={() => setSelectedTeam(t.id)} style={{ borderColor: selectedTeam === t.id ? t.color : '' }}>
                  <div className="pick-badge" style={{ background: t.color }}>{t.shortName}</div>
                  <span>{t.name}</span>
                </div>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary join-submit">Enter Auction →</button>
        </form>
      </div>
    </div>
  );
};

export default JoinRoom;
