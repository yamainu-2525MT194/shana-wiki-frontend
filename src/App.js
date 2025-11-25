import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout'; // ← ★★★ 新しい骨格をインポート ★★★
import LoginPage from './LoginPage';
import DashboardPage from './DashboardPage';
import AdminPage from './AdminPage';
import WikiPage from './WikiPage';
import PageEditor from './PageEditor';
import EngineerStatusPage from './EngineerStatusPage'; // ★★★ 新しいページをインポート ★★★
import EngineerDetailPage from './EngineerDetailPage'; // ★★★ エンジニア個別ページをインポート ★★★
import UserManagementPage from './UserManagementPage';
import SearchResultsPage from './SearchResultsPage';
import CustomerListPage from './CustomerListPage';
import CustomerDetailPage from './CustomerDetailPage';
import OpportunityDetailPage from './OpportunityDetailPage'; // ★★★ 新しいページをインポート ★★★
import LoginHistoryPage from './LoginHistoryPage';
import ActivityLogPage from './ActivityLogPage';
import IncidentsPage from './IncidentsPage';
import ChatPage from './ChatPage';
import IncidentDetailPage from './IncidentDetailPage';
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
            <Route 
              path="/pages/new" 
              element={
                <PageEditor 
                  onSaveSuccess={() => window.location.href = '/dashboard'} 
                  onCancel={() => window.location.href = '/dashboard'} 
                />
              } 
            />
            <Route 
              path="/pages/edit/:pageId" 
              element={
                <PageEditor 
                  onSaveSuccess={(id) => window.location.href = `/pages/${id}`} 
                  onCancel={() => window.history.back()} 
                />
              } 
            />
            {/* ★★★ ここまで修正 ★★★ */}
            <Route path="/pages/:pageId" element={<WikiPage />} />
            <Route path="/engineers" element={<EngineerStatusPage />} />
            <Route path="/engineers/:engineerId" element={<EngineerDetailPage />} />
            <Route path="/customers" element={<CustomerListPage />} />
            <Route path="/customers/:customerId" element={<CustomerDetailPage />} />
            <Route path="/opportunities/:opportunityId" element={<OpportunityDetailPage />} />
            <Route path="/users/manage" element={<UserManagementPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/admin/login-history" element={ <LoginHistoryPage />}/>
            <Route path="/admin/activity-logs" element={<ActivityLogPage />} />
            <Route path="/incidents" element={<IncidentsPage />} />
            <Route path="/incidents/:incidentId" element={<IncidentDetailPage />} />
            <Route path="/chat" element={<ChatPage />} />
          </Route>
          {/* --- ↑↑↑ ログイン後のページは全てLayoutの中に配置 ↑↑↑ --- */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;