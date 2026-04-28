import React from 'react';
import './PlayerCard.scss';

const PlayerCard = ({ player }) => {
  if (!player) return <div className="player-card empty">Waiting for next player...</div>;
  
  return (
    <div className="player-card active">
      <div className="card-header">
        <span className="player-role">{player.role}</span>
        <span className="player-country">{player.country}</span>
      </div>
      
      <div className="photo-container">
        {player.photo_url ? (
          <img src={player.photo_url} alt={player.name} className="photo" />
        ) : (
          <div className="avatar-fallback">
            {player.name.split(' ').map(w => w[0]).join('')}
          </div>
        )}
      </div>

      <div className="card-body">
        <h2 className="player-name">{player.name}</h2>
        <h3 className="base-price">Base Price: ₹{player.base_price} Cr</h3>
        
        <div className="stats-row">
          <div className="stat">
            <span className="label">BAT</span>
            <div className="bar-container">
              <div className="bar fill-gold" style={{ width: `${(player.batting_strength / 10) * 100}%` }}></div>
            </div>
            <span className="val">{player.batting_strength}/10</span>
          </div>
          <div className="stat">
            <span className="label">BOWL</span>
            <div className="bar-container">
              <div className="bar fill-green" style={{ width: `${(player.bowling_strength / 10) * 100}%` }}></div>
            </div>
            <span className="val">{player.bowling_strength}/10</span>
          </div>
        </div>
        
        <div className="tags">
          {player.is_overseas && <span className="tag overseas">✈️ Overseas</span>}
          {player.is_uncapped && <span className="tag uncapped">🌟 Uncapped</span>}
        </div>
      </div>
    </div>
  );
};

export default PlayerCard;
