import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import GameDetailPage from './pages/GameDetailPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ExerionGame from './games/ExerionGame';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/game/:id" element={<GameDetailPage />} />
              <Route path="/game/exerion" element={<ExerionGame />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
