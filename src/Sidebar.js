import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
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

        <Link to="/admin" className="page-item">
          <span className="icon">⚙️</span>
          <span className="title">管理者ページ</span>
        </Link>
      </div>

      <div className="sidebar-footer">
        <button className="sidebar-button">
          <span>設定</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;