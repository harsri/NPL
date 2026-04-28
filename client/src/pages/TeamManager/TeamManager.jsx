import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './TeamManager.scss';

const API = 'http://localhost:5000';

const TeamManager = () => {
  const { code } = useParams();
  const teamId = new URLSearchParams(window.location.search).get('team') || 'team1';

  const [state, setState] = useState(null);
  const [bidError, setBidError] = useState(null);
  const [bidSuccess, setBidSuccess] = useState(null);

  // Poll auction state every 500ms
  useEffect(() => {
    const poll = setInterval(() => {
      axios.get(`${API}/api/auction/state`).then(res => setState(res.data)).catch(() => {});
    }, 500);
    axios.get(`${API}/api/auction/state`).then(res => setState(res.data));
    return () => clearInterval(poll);
  }, []);

  const myTeam = state?.teams?.find(t => t.id === teamId);
  const isLeading = state?.leadingTeamId === teamId;

  const placeBid = () => {
    setBidError(null);
    setBidSuccess(null);
    axios.post(`${API}/api/auction/bid`, { teamId })
      .then(res => setBidSuccess(`Bid placed! ₹${res.data.currentBid.toFixed(2)} Cr`))
      .catch(err => setBidError(err.response?.data?.error || 'Bid failed'));
  };

  if (!state || !myTeam) return <div className="team-manager-layout"><div className="loading">Loading team data...</div></div>;

  const timerColor = state.timerRemaining <= 5 ? '#EF4444' : state.timerRemaining <= 10 ? '#F97316' : '#F4A900';
  const timerPercent = (state.timerRemaining / 30) * 100;

  return (
    <div className="team-manager-layout">
      {/* Header */}
      <header className="team-header">
        <div className="brand-section">
          <span className="team-badge" style={{ background: myTeam.color }}>{myTeam.shortName}</span>
          <h1>{myTeam.name}</h1>
        </div>
        <div className="purse-display">
          Purse: <strong style={{ color: myTeam.purse < 20 ? '#EF4444' : '#F4A900' }}>₹{myTeam.purse.toFixed(1)} Cr</strong>
        </div>
      </header>

      <div className="main-layout">
        {/* LEFT: My Squad */}
        <aside className="squad-panel">
          <h2>🏏 My Squad ({myTeam.squad.length})</h2>
          {myTeam.squad.length === 0 ? (
            <p className="empty-squad">No players acquired yet. Place bids to build your team!</p>
          ) : (
            <div className="squad-items">
              {myTeam.squad.map(p => (
                <div key={p.id} className="squad-item">
                  <div>
                    <span className="sq-name">{p.name}</span>
                    <span className="sq-role">{p.role}</span>
                  </div>
                  <span className="sq-price">₹{p.soldPrice.toFixed(2)} Cr</span>
                </div>
              ))}
            </div>
          )}
          <div className="squad-summary">
            <span>Overseas: {myTeam.squad.filter(p => p.is_overseas).length}/6</span>
          </div>
        </aside>

        {/* CENTER: Active Auction */}
        <main className="auction-center">
          {state.activePlayer ? (
            <div className="live-bid-area">
              {/* Timer */}
              <div className="timer-section">
                <svg className="timer-ring" viewBox="0 0 100 100">
                  <circle className="ring-bg" cx="50" cy="50" r="42" />
                  <circle className="ring-fill" cx="50" cy="50" r="42"
                    style={{ stroke: timerColor, strokeDasharray: 264, strokeDashoffset: 264 - (264 * timerPercent) / 100 }} />
                  <text x="50" y="55" textAnchor="middle" className="timer-text" fill="#fff">{state.timerRemaining}s</text>
                </svg>
              </div>

              {/* Player Info */}
              <div className="player-showcase">
                <div className="player-avatar">{state.activePlayer.name.split(' ').map(w => w[0]).join('')}</div>
                <h2>{state.activePlayer.name}</h2>
                <div className="player-tags">
                  <span className="tag">{state.activePlayer.role}</span>
                  <span className="tag">{state.activePlayer.country}</span>
                  {state.activePlayer.is_overseas && <span className="tag overseas">OVERSEAS</span>}
                </div>
                <div className="strength-bars">
                  <div className="bar-row"><span>BAT</span><div className="bar-track"><div className="bar-fill bat" style={{ width: `${state.activePlayer.batting_strength * 10}%` }}></div></div><span>{state.activePlayer.batting_strength}</span></div>
                  <div className="bar-row"><span>BOWL</span><div className="bar-track"><div className="bar-fill bowl" style={{ width: `${state.activePlayer.bowling_strength * 10}%` }}></div></div><span>{state.activePlayer.bowling_strength}</span></div>
                </div>
              </div>

              {/* Current Bid */}
              <div className="bid-info">
                <span className="bid-label">Current Bid</span>
                <span className="bid-amount">₹{state.currentBid.toFixed(2)} Cr</span>
                {state.leadingTeamId && (
                  <span className={`leading ${isLeading ? 'you' : ''}`}>
                    {isLeading ? '🟢 YOU are leading!' : `Leading: ${state.teams.find(t => t.id === state.leadingTeamId)?.name}`}
                  </span>
                )}
              </div>

              {/* Announcement from Auctioneer */}
              {state.announcement && (
                <div className="announcement-banner">{state.announcement}</div>
              )}

              {/* BID BUTTON */}
              <button
                className={`big-bid-btn ${isLeading ? 'disabled' : ''}`}
                onClick={placeBid}
                disabled={isLeading}
              >
                {isLeading ? 'YOU ARE LEADING' : `💰 PLACE BID — ₹${(state.currentBid + (state.currentBid < 5 ? 0.25 : 0.5)).toFixed(2)} Cr`}
              </button>

              {bidError && <div className="bid-feedback error">{bidError}</div>}
              {bidSuccess && <div className="bid-feedback success">{bidSuccess}</div>}
            </div>
          ) : (
            <div className="waiting-area">
              <div className="cricket-anim">🏏</div>
              <h2>Waiting for Auctioneer</h2>
              <p>The auctioneer will put the next player on the block shortly...</p>
            </div>
          )}
        </main>

        {/* RIGHT: All Teams Overview */}
        <aside className="others-panel">
          <h2>📊 All Teams</h2>
          {state.teams.map(t => (
            <div key={t.id} className={`other-team ${t.id === teamId ? 'my-team' : ''}`} style={{ borderLeftColor: t.color }}>
              <div className="ot-header">
                <strong>{t.shortName}</strong>
                <span>₹{t.purse.toFixed(1)} Cr</span>
              </div>
              <span className="ot-count">{t.squad.length} players</span>
            </div>
          ))}

          <h2 style={{ marginTop: '1rem' }}>📋 Recent Activity</h2>
          <div className="mini-log">
            {(state.log || []).slice(0, 8).map((e, i) => (
              <div key={i} className="mini-log-entry">{e.msg}</div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default TeamManager;
