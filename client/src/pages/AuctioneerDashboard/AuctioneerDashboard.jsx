import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import socketClient from '../../socket/socketClient';
import PlayerCard from '../../components/PlayerCard/PlayerCard';
import './AuctioneerDashboard.scss';

const AuctioneerDashboard = () => {
  const { code } = useParams();
  const [activePlayer, setActivePlayer] = useState(null);
  
  // Placeholder data for the pool
  const playersPool = [
    { id: 'p1', name: 'Virat Kohli', role: 'BATSMAN', base_price: 2.0, is_overseas: false },
    { id: 'p2', name: 'Pat Cummins', role: 'BOWLER', base_price: 2.0, is_overseas: true },
    { id: 'p3', name: 'MS Dhoni', role: 'WICKETKEEPER', base_price: 2.0, is_overseas: false },
  ];

  const handlePutOnBlock = (player) => {
    setActivePlayer(player);
    socketClient.emit('auction:player_up', { roomId: code, player_id: player.id, timer_seconds: 60 });
  };

  const handleAcceptBid = (teamId, amount) => {
    socketClient.emit('bid:accept', { roomId: code, team_id: teamId, amount });
  };

  return (
    <div className="auctioneer-dashboard">
      <header className="dashboard-header">
        <h1>NPL Auction Control: Room {code}</h1>
        <button className="btn-danger end-btn">END AUCTION</button>
      </header>

      <div className="dashboard-grid">
        {/* Left: Player Pool */}
        <aside className="panel pool-panel">
          <h2>Player Pool</h2>
          <div className="filters">
            <select><option>All Roles</option></select>
            <select><option>All Sets</option></select>
          </div>
          
          <div className="player-list">
            {playersPool.map(p => (
              <div key={p.id} className={`list-item ${activePlayer?.id === p.id ? 'active' : ''}`} onClick={() => handlePutOnBlock(p)}>
                <span className="name">{p.name}</span>
                <span className="price">₹{p.base_price.toFixed(2)} Cr</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Center: Live Action */}
        <main className="panel live-panel">
          <div className="center-stage">
            {activePlayer ? (
              <>
                <PlayerCard player={activePlayer} />
                <div className="live-activity">
                  <h3>Incoming Bids</h3>
                  <div className="bid-stream">
                    {/* Placeholder dynamic bids */}
                    <div className="bid-card">
                      <div className="info">
                        <strong>Mumbai Indians</strong>
                        <span>₹2.50 Cr</span>
                      </div>
                      <div className="actions">
                        <button className="btn-accept" onClick={() => handleAcceptBid('team1', 2.50)}>ACCEPT</button>
                        <button className="btn-reject">REJECT</button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="waiting-state">Select a player from the pool to put on the block.</div>
            )}
          </div>
        </main>

        {/* Right: Team Tracker */}
        <aside className="panel teams-panel">
          <h2>Team Tracker</h2>
          <div className="team-stats-card">
             <h4>Mumbai Indians</h4>
             <div className="progress-bar"><div className="fill" style={{width: '60%'}}></div></div>
             <div className="stats">
               <span>P: ₹75Cr</span>
               <span>Sq: 15/25</span>
               <span>Ov: 4/6</span>
             </div>
          </div>
          <div className="team-stats-card">
             <h4>Chennai Super Kings</h4>
             <div className="progress-bar"><div className="fill" style={{width: '80%'}}></div></div>
             <div className="stats">
               <span>P: ₹40Cr</span>
               <span>Sq: 20/25</span>
               <span>Ov: 5/6</span>
             </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default AuctioneerDashboard;
