import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout'; // ← ★★★ 新しい骨格をインポート ★★★
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import AdminPage from './AdminPage';
import WikiPage from './WikiPage';
import PageEditor from './PageEditor';
import EngineerStatusPage from './EngineerStatusPage'; // ★★★ 新しいページをインポート ★★★
import './App.css';

function App() {
  return (
    <Router>
      {/* App.cssの黒い背景はログインページだけに適用する */}
      <div className="App">
        <Routes>
          {/* ログインページは骨格の外に配置 */}
          <Route path="/" element={<LoginPage />} />

          {/* --- ↓↓↓ ログイン後のページは全てLayoutの中に配置 ↓↓↓ --- */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/pages/new" element={<PageEditor />} />
            <Route path="/pages/edit/:pageId" element={<PageEditor />} />
            <Route path="/pages/:pageId" element={<WikiPage />} />
            <Route path="/engineers" element={<EngineerStatusPage />} />
          </Route>
          {/* --- ↑↑↑ ログイン後のページは全てLayoutの中に配置 ↑↑↑ --- */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;