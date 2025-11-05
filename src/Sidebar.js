import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="workspace-info">
          <div className="workspace-icon">W</div>
          <div className="workspace-text">
            <h1>社内Wiki</h1>
            <p>ワークスペース</p>
          </div>
        </div>
      </div>

      <div className="pages-list">
        <Link to="/dashboard" className="page-item">
          <span className="icon">🏠</span>
          <span className="title">ダッシュボード</span>
        </Link>
        
        <Link to="/engineers" className="page-item">
          <span className="icon">👨‍💻</span>
          <span className="title">エンジニア状況管理</span>
        </Link>

        <Link to="/customers" className="page-item">
          <span className="icon">🏢</span>
          <span className="title">顧客管理</span>
        </Link>

        <Link to="/users/manage" className="page-item">
          <span className="icon">👥</span>
          <span className="title">ユーザー管理</span>
        </Link>

        <Link to="/admin" className="page-item">
          <span className="icon">📝</span>
          <span className="title">各種登録ページ</span>
        </Link>
        
      </div>

      <div className="sidebar-footer">
        <button className="sidebar-button" onClick={handleLogout}>
          <span>ログアウト</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;