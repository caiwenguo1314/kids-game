import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import MemoryGame from './pages/MemoryGame';
import MazeGame from './pages/MazeGame';
import MarioGame from './pages/MarioGame';
import './App.css';

function App() {
  return (
    <Router>
      <div className="nav-container">
        <nav className="nav-bar">
          <Link to="/" className="nav-button">
            记忆游戏
          </Link>
          <Link to="/maze" className="nav-button">
            迷宫游戏
          </Link>
          <Link to="/mario" className="nav-button">
            超级马里奥
          </Link>
        </nav>
      </div>

      <div className="content">
        <Routes>
          <Route path="/" element={<MemoryGame />} />
          <Route path="/maze" element={<MazeGame />} />
          <Route path="/mario" element={<MarioGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
