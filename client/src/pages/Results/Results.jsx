import React from 'react';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './Results.scss';

const Results = () => {
  const { code } = useParams();

  // MOCK DATA for Results presentation
  const mockTeams = [
    {
      id: 't1',
      name: 'Mumbai Indians',
      purseRemaining: 40.5,
      totalSpent: 79.5,
      roleCounts: { BATSMAN: 5, BOWLER: 6, ALLROUNDER: 3, WICKETKEEPER: 1 },
      overseas: 4,
      uncapped: 2,
      score: 8.2,
      isDisqualified: false,
      players: [
        { name: 'Rohit Sharma', role: 'BATSMAN', price: 15.0 },
        { name: 'Jasprit Bumrah', role: 'BOWLER', price: 12.0 }
      ]
    },
    {
      id: 't2',
      name: 'Royal Challengers',
      purseRemaining: 10.0,
      totalSpent: 110.0,
      roleCounts: { BATSMAN: 7, BOWLER: 4, ALLROUNDER: 2, WICKETKEEPER: 0 },
      overseas: 5,
      uncapped: 1,
      score: 8.9,
      isDisqualified: true,
      reason: 'At least 1 wicketkeeper required',
      players: [
        { name: 'Virat Kohli', role: 'BATSMAN', price: 17.0 },
        { name: 'Glenn Maxwell', role: 'ALLROUNDER', price: 11.0 }
      ]
    }
  ];

  const exportTeamPDF = (team) => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text(`${team.name} - Final Squad`, 14, 20);
    
    doc.setFontSize(12);
    doc.text(`Total Spent: ₹${team.totalSpent} Cr | Purse Remaining: ₹${team.purseRemaining} Cr`, 14, 30);
    doc.text(`Quality Score: ${team.score} | Overseas: ${team.overseas}/6`, 14, 38);

    if (team.isDisqualified) {
      doc.setTextColor(255, 0, 0);
      doc.text(`STATUS: DISQUALIFIED - ${team.reason}`, 14, 46);
    }

    const tableData = team.players.map(p => [p.name, p.role, `₹${p.price.toFixed(2)} Cr`]);

    doc.autoTable({
      startY: 55,
      head: [['Player Name', 'Role', 'Final Price']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [244, 169, 0], textColor: [0, 0, 0] }
    });

    doc.save(`${team.name}_Squad_NPL.pdf`);
  };

  const exportFullAuctionPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(24);
    doc.text(`NPL Full Auction Summary - Room ${code}`, 14, 20);

    let startY = 30;
    mockTeams.forEach((team) => {
      doc.setFontSize(16);
      doc.setTextColor(team.isDisqualified ? 255 : 0, 0, 0);
      doc.text(`${team.name} ${team.isDisqualified ? '(DISQUALIFIED)' : ''}`, 14, startY);
      
      const tableData = team.players.map(p => [p.name, p.role, `₹${p.price.toFixed(2)} Cr`]);

      doc.autoTable({
        startY: startY + 5,
        head: [['Player Name', 'Role', 'Final Price']],
        body: tableData,
        theme: 'striped'
      });

      startY = doc.lastAutoTable.finalY + 15;
    });

    doc.save(`NPL_Full_Summary_${code}.pdf`);
  };

  return (
    <div className="results-page">
      <header className="results-header">
        <h1>NPL Auction Completed</h1>
        <div className="header-actions">
           <button className="btn-primary" onClick={exportFullAuctionPDF}>Download Full Summary PDF</button>
        </div>
      </header>

      <div className="teams-grid">
        {mockTeams.map(team => (
          <div key={team.id} className={`result-card ${team.isDisqualified ? 'disqualified' : ''}`}>
             <div className="card-top">
                <h2>{team.name}</h2>
                <div className="score-badge">Score: {team.score}</div>
             </div>

             {team.isDisqualified && (
               <div className="disqualify-banner">
                  DISQUALIFIED: {team.reason}
               </div>
             )}

             <div className="stats-grid">
                <div className="stat-box">
                  <span className="label">Spent</span>
                  <span className="val">₹{team.totalSpent}</span>
                </div>
                <div className="stat-box">
                  <span className="label">Purse</span>
                  <span className="val">₹{team.purseRemaining}</span>
                </div>
                <div className="stat-box">
                  <span className="label">Overseas</span>
                  <span className="val">{team.overseas}/6</span>
                </div>
             </div>

             <div className="role-breakdown">
                <span className="pill">BAT: {team.roleCounts.BATSMAN}</span>
                <span className="pill">BOWL: {team.roleCounts.BOWLER}</span>
                <span className="pill">AR: {team.roleCounts.ALLROUNDER}</span>
                <span className="pill">WK: {team.roleCounts.WICKETKEEPER}</span>
             </div>

             <button className="btn-download" onClick={() => exportTeamPDF(team)}>
               Download Team PDF
             </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Results;
