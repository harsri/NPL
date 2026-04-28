import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import socketClient from '../../socket/socketClient';
import { useAuctionStore } from '../../store/auctionStore';
import { useTeamStore } from '../../store/teamStore';
import PlayerCard from '../../components/PlayerCard/PlayerCard';
import './TeamManager.scss';

const TeamManager = () => {
  const { code } = useParams();
  const { currentPlayerId, currentBid, timerSecondsLeft, timerPercent, phase } = useAuctionStore();
  const { purseRemaining, warnings } = useTeamStore();
  
  // Local state to simulate fetching real player info
  const [activePlayer, setActivePlayer] = useState(null);

  useEffect(() => {
    // In a real flow, this fetches the player object via REST or receives it in socket
    if (currentPlayerId) {
      setActivePlayer({
        id: currentPlayerId,
        name: "Virat Kohli", 
        role: "BATSMAN",
        country: "India",
        base_price: 2.0,
        batting_strength: 10,
        bowling_strength: 2,
        is_overseas: false,
        is_uncapped: false,
        photo_url: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320/lsci/db/PICTURES/CMS/316000/316158.jpg"
      });
    } else {
      setActivePlayer(null);
    }
  }, [currentPlayerId]);

  const handleVote = (choice) => {
    socketClient.emit('vote:cast', { teamId: 'my_team_id', choice, isCaptain: false });
  };

  const ringColor = timerSecondsLeft <= 10 ? '#EF4444' : timerSecondsLeft <= 20 ? '#F97316' : '#F4A900';

  return (
    <div className="team-manager-layout">
      {/* Top Banner */}
      <header className="team-header">
        <div className="brand">NPL Team Dashboard</div>
        <div className="purse-tracker">
          Purse: <span className="amt">₹{purseRemaining.toFixed(2)} Cr</span>
        </div>
      </header>

      {/* Warnings Slide-down */}
      <div className="warnings-container">
        {warnings.map((w, idx) => (
          <div key={idx} className="warning-banner">
            {w.message}
          </div>
        ))}
      </div>

      <div className="main-content">
        <div className="sidebar left">
          <h3>Squad (0/25)</h3>
          {/* Squad list renderer */}
        </div>

        <div className="center-stage">
          <PlayerCard player={activePlayer} />
          
          {phase === 'BIDDING' && activePlayer && (
            <div className="bidding-controls">
              <div className="timer-wrapper">
                <svg className="timer-ring" width="80" height="80">
                  <circle
                    className="ring-bg"
                    cx="40" cy="40" r="36"
                  />
                  <circle
                    className={`ring-prog ${timerSecondsLeft <= 10 ? 'pulse' : ''}`}
                    cx="40" cy="40" r="36"
                    style={{
                       stroke: ringColor,
                       strokeDasharray: 226,
                       strokeDashoffset: 226 - (226 * timerPercent) / 100
                    }}
                  />
                  <text x="50%" y="50%" dy=".3em" textAnchor="middle" fill="#fff" className="time-text">
                    {timerSecondsLeft}
                  </text>
                </svg>
              </div>

              <div className="current-bid-display">
                Current Bid: <span className="val">₹{currentBid > 0 ? currentBid.toFixed(2) : activePlayer.base_price.toFixed(2)} Cr</span>
              </div>

              <div className="vote-panel">
                <button className="btn-vote bid" onClick={() => handleVote('bid')}>
                  BID
                </button>
                <div className="tally">
                  Waiting for team...
                </div>
                <button className="btn-vote skip" onClick={() => handleVote('skip')}>
                  SKIP
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="sidebar right">
          <h3>Team Chat</h3>
          {/* Chat Panel renderer */}
        </div>
      </div>
    </div>
  );
};

export default TeamManager;
