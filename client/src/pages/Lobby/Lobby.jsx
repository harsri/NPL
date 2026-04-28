import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import socketClient from '../../socket/socketClient';
import './Lobby.scss';

const Lobby = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  // Mock data for display purposes
  const [teams, setTeams] = useState([
    { id: '1', name: 'Mumbai Indians', members: [{ name: 'User 1', isCaptain: true }, { name: 'User 2', isCaptain: false }], isFull: false },
    { id: '2', name: 'Chennai Super Kings', members: [{ name: 'User 3', isCaptain: true }], isFull: false },
    { id: '3', name: 'Royal Challengers', members: [], isFull: false },
  ]);
  const [isAuctioneer, setIsAuctioneer] = useState(true); // Assuming true for now

  useEffect(() => {
    // Connect user and join lobby
    socketClient.emit('room:join', { roomCode: code });
    
    // In a real flow, listen for 'room:state_update' to refresh teams array
  }, [code]);

  const handleStartAuction = () => {
    // Only auctioneer can start
    socketClient.emit('auction:start', { roomCode: code });
    navigate(`/room/${code}/auctioneer`);
  };

  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <h1>Room LOBBY: <span className="room-code">{code}</span></h1>
        <p>Waiting for participants to join...</p>
      </div>

      <div className="teams-grid">
        {teams.map((team) => (
          <div key={team.id} className="team-card">
            <h2 className="team-name">{team.name}</h2>
            <div className="team-members">
              {team.members.length === 0 ? (
                <p className="empty-text">No members yet</p>
              ) : (
                team.members.map((member, idx) => (
                  <div key={idx} className={`member ${member.isCaptain ? 'captain' : ''}`}>
                    <span className="avatar">{member.name[0]}</span>
                    <span className="name">{member.name}</span>
                    {member.isCaptain && <span className="role-badge">C</span>}
                  </div>
                ))
              )}
            </div>
            {!team.isFull && !isAuctioneer && (
               <button className="btn-join">Join Team</button>
            )}
          </div>
        ))}
      </div>

      {isAuctioneer ? (
        <div className="auctioneer-controls">
          <button className="btn-primary start-btn" onClick={handleStartAuction}>
            Start Auction
          </button>
        </div>
      ) : (
        <div className="waiting-indicator">
          <div className="spinner"></div>
          Waiting for Auctioneer to start...
        </div>
      )}
    </div>
  );
};

export default Lobby;
