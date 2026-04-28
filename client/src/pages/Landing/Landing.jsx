import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Landing.scss';

const Landing = () => {
  const navigate = useNavigate();

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
      
      {/* Live public rooms list would be fetched here */}
      <div className="rooms-container">
        <h3>Live Public Rooms</h3>
        <p className="no-rooms-msg">No active public rooms right now. Host one to get started!</p>
      </div>
    </div>
  );
};

export default Landing;
