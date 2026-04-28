import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Landing.scss';

const Landing = () => {
  const navigate = useNavigate();
  const [liveRooms, setLiveRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/rooms/public');
        setLiveRooms(response.data);
      } catch (err) {
        console.error('Failed to fetch rooms', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  return (
    <div className="landing-page">
      <div className="hero-section">
        <h1 className="title">IIIT Nagpur Premier League</h1>
        <h2 className="subtitle">Real-time Auction Platform</h2>
        
        <div className="action-buttons">
          <button className="btn-primary" onClick={() => navigate('/auth')}>
            Host Auction
          </button>
          
          <button className="btn-secondary" onClick={() => navigate('/room/join')}>
            Join Room
          </button>
          
          <button className="btn-tertiary" onClick={() => navigate('/practice')}>
            Practice Mode
          </button>
        </div>
      </div>
      
      <div className="rooms-container">
        <h3>Live Public Rooms</h3>
        {loading ? (
          <p className="no-rooms-msg">Fetching active rooms...</p>
        ) : liveRooms.length === 0 ? (
          <p className="no-rooms-msg">No active public rooms right now. Host one to get started!</p>
        ) : (
          <div className="room-list">
             {liveRooms.map(room => (
               <div key={room.id} className="room-item" style={{display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #374151'}}>
                  <div>
                    <h4 style={{marginBottom: '0.2rem'}}>{room.name}</h4>
                    <span style={{fontSize: '0.8rem', color: '#9CA3AF'}}>Code: {room.code} • Teams: {room._count?.teams || 0}/{room.max_teams}</span>
                  </div>
                  <button className="btn-tertiary" onClick={() => navigate(`/room/${room.code}/lobby`)}>Join</button>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Landing;
