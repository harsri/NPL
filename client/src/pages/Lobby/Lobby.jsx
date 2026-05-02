import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import './Lobby.scss';

const TEAM_OPTIONS = [
  { id: 'team1', name: 'Mumbai Indians', shortName: 'MI', color: '#004BA0' },
  { id: 'team2', name: 'Chennai Super Kings', shortName: 'CSK', color: '#F9CD05' },
  { id: 'team3', name: 'Royal Challengers', shortName: 'RCB', color: '#D61C1C' },
  { id: 'team4', name: 'Kolkata Knight Riders', shortName: 'KKR', color: '#3A225D' },
];

const Lobby = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  
  // Determine role: if JWT exists in localStorage → auctioneer, otherwise → team
  const isAuctioneer = !!localStorage.getItem('npl_token');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [auctionStarted, setAuctionStarted] = useState(false);

  // Teams poll auction state to detect when auctioneer starts auction
  useEffect(() => {
    if (isAuctioneer) return; // Auctioneer doesn't need to poll

    const poll = setInterval(() => {
      axios.get(`${API_BASE_URL}/api/auction/state`).then(res => {
        // If the auction is in BIDDING or has sold players, it's started
        if (res.data.status === 'BIDDING' || res.data.soldPlayerIds.length > 0) {
          setAuctionStarted(true);
          clearInterval(poll);
          // Auto-redirect team to their manager view
          if (selectedTeam) {
            navigate(`/room/${code}/team?team=${selectedTeam}`);
          }
        }
      }).catch(() => {});
    }, 1000);

    return () => clearInterval(poll);
  }, [isAuctioneer, selectedTeam, code, navigate]);

  const handleStartAuction = () => {
    navigate(`/room/${code}/auctioneer`);
  };

  const handleTeamReady = (teamId) => {
    setSelectedTeam(teamId);
    // If auction is already started, go directly
    axios.get(`${API_BASE_URL}/api/auction/state`).then(res => {
      if (res.data.status === 'BIDDING' || res.data.soldPlayerIds.length > 0) {
        navigate(`/room/${code}/team?team=${teamId}`);
      }
    });
  };

  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <h1>Room LOBBY: <span className="room-code">{code}</span></h1>
        <p>{isAuctioneer ? 'You are the Auctioneer. Start when ready!' : 'Select your team and wait for the auctioneer to start.'}</p>
      </div>

      {/* Team Selection Grid — visible to team managers */}
      {!isAuctioneer && (
        <div className="teams-grid">
          {TEAM_OPTIONS.map(team => (
            <div
              key={team.id}
              className={`team-card ${selectedTeam === team.id ? 'selected' : ''}`}
              style={{ borderColor: selectedTeam === team.id ? team.color : '' }}
              onClick={() => handleTeamReady(team.id)}
            >
              <div className="team-badge" style={{ background: team.color }}>{team.shortName}</div>
              <h2 className="team-name">{team.name}</h2>
              {selectedTeam === team.id && <span className="check">✓ Selected</span>}
            </div>
          ))}
        </div>
      )}

      {/* Auctioneer: Start Button */}
      {isAuctioneer && (
        <div className="auctioneer-controls">
          <button className="btn-primary start-btn" onClick={handleStartAuction}>
            🏏 Start Auction
          </button>
        </div>
      )}

      {/* Team: Waiting Indicator */}
      {!isAuctioneer && (
        <div className="waiting-indicator">
          {selectedTeam ? (
            auctionStarted ? (
              <p className="redirecting">🎉 Auction started! Redirecting...</p>
            ) : (
              <>
                <div className="spinner"></div>
                <p>Waiting for Auctioneer to start the auction...</p>
                <p className="hint">You'll be automatically redirected when it begins.</p>
              </>
            )
          ) : (
            <p className="hint">👆 Select a team above to join</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Lobby;
