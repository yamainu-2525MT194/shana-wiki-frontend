import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import AdminPage from './AdminPage';
import WikiPage from './WikiPage'; // WikiPageもインポート
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/pages/:pageId" element={<WikiPage />} />
          </Routes>
        </header>
      </div>
    </Router>
  );
}

export default App; // ← ★★★ これが重要な名札です ★★★