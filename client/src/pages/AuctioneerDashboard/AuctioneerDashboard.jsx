import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../../config/api';
import './AuctioneerDashboard.scss';

const AuctioneerDashboard = () => {
  const { code } = useParams();
  const [pool, setPool] = useState([]);
  const [state, setState] = useState(null);
  const [filterRole, setFilterRole] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Load players once
  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/players`).then(res => { setPool(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  // Poll auction state every 500ms
  useEffect(() => {
    const poll = setInterval(() => {
      axios.get(`${API_BASE_URL}/api/auction/state`).then(res => setState(res.data)).catch(() => {});
    }, 500);
    // Initial fetch
    axios.get(`${API_BASE_URL}/api/auction/state`).then(res => setState(res.data));
    return () => clearInterval(poll);
  }, []);

  const soldIds = new Set(state?.soldPlayerIds || []);
  const available = pool.filter(p => !soldIds.has(p.id) && (filterRole === 'ALL' || p.role === filterRole));

  const putOnBlock = (player) => {
    axios.post(`${API_BASE_URL}/api/auction/put-on-block`, { player }).catch(err => alert(err.response?.data?.error || 'Error'));
  };

  const acceptBid = () => {
    axios.post(`${API_BASE_URL}/api/auction/accept`).catch(err => alert(err.response?.data?.error || 'Error'));
  };

  const markUnsold = () => {
    axios.post(`${API_BASE_URL}/api/auction/unsold`).catch(err => alert(err.response?.data?.error || 'Error'));
  };

  const askMoreBids = () => {
    axios.post(`${API_BASE_URL}/api/auction/ask-more-bids`).catch(err => alert(err.response?.data?.error || 'Error'));
  };

  if (loading || !state) return <div className="auctioneer-dashboard"><div className="loading-state">Loading...</div></div>;

  const timerColor = state.timerRemaining <= 5 ? '#EF4444' : state.timerRemaining <= 10 ? '#F97316' : '#F4A900';
  const timerPercent = (state.timerRemaining / 30) * 100;

  return (
    <div className="auctioneer-dashboard">
      <header className="dashboard-header">
        <div className="brand"><span className="cricket-icon">🏏</span><h1>NPL Auctioneer Panel</h1></div>
        <div className="auction-stats">
          <span className="stat">Sold: <strong>{soldIds.size}</strong></span>
          <span className="stat">Remaining: <strong>{pool.length - soldIds.size}</strong></span>
        </div>
      </header>

      <div className="dashboard-grid">
        {/* LEFT: Player Pool */}
        <aside className="panel pool-panel">
          <h2>🏏 Player Pool ({available.length})</h2>
          <div className="filters">
            {['ALL', 'BATSMAN', 'BOWLER', 'ALLROUNDER', 'WICKETKEEPER'].map(r => (
              <button key={r} className={`filter-btn ${filterRole === r ? 'active' : ''}`} onClick={() => setFilterRole(r)}>
                {r === 'ALL' ? 'All' : r === 'WICKETKEEPER' ? 'WK' : r === 'ALLROUNDER' ? 'AR' : r.charAt(0) + r.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="player-list">
            {available.map(p => (
              <div key={p.id} className={`player-item ${state.activePlayer?.id === p.id ? 'on-block' : ''}`}
                onClick={() => state.status === 'WAITING' && putOnBlock(p)}>
                <div className="player-info">
                  <span className="player-name">{p.name}</span>
                  <span className="player-meta">{p.role} • {p.country}</span>
                </div>
                <div className="player-stats-mini">
                  <span className="stat-badge">🏏{p.batting_strength}</span>
                  <span className="stat-badge">⚾{p.bowling_strength}</span>
                </div>
                <span className="base-price">₹{p.base_price} Cr</span>
              </div>
            ))}
          </div>
        </aside>

        {/* CENTER */}
        <main className="panel live-panel">
          {state.activePlayer ? (
            <div className="auction-stage">
              <div className="timer-section">
                <svg className="timer-ring" viewBox="0 0 100 100">
                  <circle className="ring-bg" cx="50" cy="50" r="42" />
                  <circle className="ring-fill" cx="50" cy="50" r="42" style={{ stroke: timerColor, strokeDasharray: 264, strokeDashoffset: 264 - (264 * timerPercent) / 100 }} />
                  <text x="50" y="55" textAnchor="middle" className="timer-text" fill="#fff">{state.timerRemaining}s</text>
                </svg>
              </div>
              <div className="player-showcase">
                <div className="player-avatar">{state.activePlayer.name.split(' ').map(w => w[0]).join('')}</div>
                <h2 className="player-name">{state.activePlayer.name}</h2>
                <div className="player-tags">
                  <span className="tag role">{state.activePlayer.role}</span>
                  <span className="tag country">{state.activePlayer.country}</span>
                  {state.activePlayer.is_overseas && <span className="tag overseas">OVERSEAS</span>}
                </div>
                <div className="strength-bars">
                  <div className="bar-row"><span>Batting</span><div className="bar-track"><div className="bar-fill bat" style={{ width: `${state.activePlayer.batting_strength * 10}%` }}></div></div><span>{state.activePlayer.batting_strength}/10</span></div>
                  <div className="bar-row"><span>Bowling</span><div className="bar-track"><div className="bar-fill bowl" style={{ width: `${state.activePlayer.bowling_strength * 10}%` }}></div></div><span>{state.activePlayer.bowling_strength}/10</span></div>
                </div>
              </div>
              <div className="bid-display">
                <span className="label">Current Bid</span>
                <span className="amount">₹{state.currentBid.toFixed(2)} Cr</span>
                {state.leadingTeamId && <span className="leading-team">Leading: {state.teams.find(t => t.id === state.leadingTeamId)?.name}</span>}
              </div>

              {/* Announcement Banner */}
              {state.announcement && <div className="announcement-banner">{state.announcement}</div>}

              <div className="auctioneer-controls">
                <button className="btn-ask-more" onClick={askMoreBids}>📢 Any Further Bids?</button>
                <button className="btn-accept" onClick={acceptBid} disabled={!state.leadingTeamId}>✅ SOLD</button>
                <button className="btn-unsold" onClick={markUnsold}>❎ UNSOLD</button>
              </div>
            </div>
          ) : (
            <div className="empty-stage">
              <div className="cricket-ball">🏏</div>
              <h2>Select a player from the pool</h2>
              <p>Click any player on the left to put them on the auction block</p>
              {soldIds.size === pool.length && pool.length > 0 && <div className="auction-complete"><h2>🏆 Auction Complete!</h2></div>}
            </div>
          )}
          <div className="activity-log">
            <h3>📋 Auction Log</h3>
            <div className="log-entries">
              {(state.log || []).length === 0 ? <p className="no-log">Activity will appear here...</p> :
                state.log.map((e, i) => <div key={i} className="log-entry"><span className="log-time">{e.time}</span><span className="log-msg">{e.msg}</span></div>)}
            </div>
          </div>
        </main>

        {/* RIGHT: Teams */}
        <aside className="panel teams-panel">
          <h2>📊 Team Tracker</h2>
          {state.teams.map(team => (
            <div key={team.id} className="team-card" style={{ borderLeftColor: team.color }}>
              <div className="team-header">
                <h3>{team.name}</h3>
                <span className="purse" style={{ color: team.purse < 20 ? '#EF4444' : '#16A34A' }}>₹{team.purse.toFixed(1)} Cr</span>
              </div>
              <div className="team-stats-row"><span>Squad: {team.squad.length}</span><span>Overseas: {team.squad.filter(p => p.is_overseas).length}/6</span></div>
              {team.squad.length > 0 && <div className="squad-list">{team.squad.map(p => <div key={p.id} className="squad-player"><span>{p.name}</span><span className="sold-price">₹{p.soldPrice.toFixed(2)}</span></div>)}</div>}
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
};

export default AuctioneerDashboard;
