import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing/Landing';
import Auth from './pages/Auth/Auth';
import CreateRoom from './pages/CreateRoom/CreateRoom';
import JoinRoom from './pages/JoinRoom/JoinRoom';
import Lobby from './pages/Lobby/Lobby';
import TeamManager from './pages/TeamManager/TeamManager';
import AuctioneerDashboard from './pages/AuctioneerDashboard/AuctioneerDashboard';
import Practice from './pages/Practice/Practice';
import Results from './pages/Results/Results';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/create" element={<CreateRoom />} />
        <Route path="/room/join" element={<JoinRoom />} />
        <Route path="/room/:code/lobby" element={<Lobby />} />
        <Route path="/room/:code/team" element={<TeamManager />} />
        <Route path="/room/:code/auctioneer" element={<AuctioneerDashboard />} />
        <Route path="/room/:code/results" element={<Results />} />
        <Route path="/practice" element={<Practice />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
