import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import AdminPage from './AdminPage'; // ← ★★★この行を追加★★★
import './App.css';
import WikiPage from './WikiPage'; // ← Add this import

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/pages/:pageId" element={<WikiPage />} /> {/* ← Add this route */}
          </Routes>
        </header>
      </div>
    </Router>
  );
}