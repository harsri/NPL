import React from 'react';
import './Practice.scss';

const Practice = () => {
  return (
    <div className="practice-page">
      <div className="practice-hero">
        <div className="hero-content">
          <p className="eyebrow">Practice Arena</p>
          <h1>Train your auction instincts against adaptive AI squads.</h1>
          <p className="hero-subtext">
            Run quick mock auctions, learn bidding tempo, and fine-tune your strategy before going live.
          </p>
          <div className="hero-actions">
            <button className="btn-primary">Start Practice Draft</button>
            <button className="btn-outline">Watch a Demo Run</button>
          </div>
          <div className="hero-stats">
            <div className="stat-card">
              <span className="stat-label">Matchups</span>
              <span className="stat-value">4 AI Teams</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Speed</span>
              <span className="stat-value">30s Timer</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Difficulty</span>
              <span className="stat-value">Adaptive</span>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="ring"></div>
          <div className="ring ring--soft"></div>
          <div className="preview-card">
            <div className="preview-header">
              <span>Live Bid</span>
              <span className="chip">AI vs You</span>
            </div>
            <div className="preview-player">
              <div className="avatar">SK</div>
              <div>
                <h3>Surya K.</h3>
                <p>Allrounder • Overseas</p>
              </div>
            </div>
            <div className="preview-bid">
              <span>Current Bid</span>
              <strong>₹7.50 Cr</strong>
            </div>
            <div className="preview-actions">
              <button className="btn-ghost">Hold</button>
              <button className="btn-primary">Raise Bid</button>
            </div>
          </div>
        </div>
      </div>

      <div className="practice-grid">
        <div className="feature-card">
          <h3>Scenario Packs</h3>
          <p>Jump into curated auction scenarios: budget squeeze, overseas rush, or late-round steals.</p>
          <div className="tag-row">
            <span className="tag">Budget Squeeze</span>
            <span className="tag">RTM Blitz</span>
          </div>
        </div>
        <div className="feature-card">
          <h3>AI Team Behavior</h3>
          <p>Each AI team plays a unique style so you can practice against realistic strategies.</p>
          <div className="tag-row">
            <span className="tag">Aggressive</span>
            <span className="tag">Value-first</span>
            <span className="tag">Wildcard</span>
          </div>
        </div>
        <div className="feature-card">
          <h3>Instant Recap</h3>
          <p>Review your bid timings, misses, and steals with a clean post-auction summary.</p>
          <button className="btn-outline small">View Sample Report</button>
        </div>
      </div>
    </div>
  );
};
export default Practice;
