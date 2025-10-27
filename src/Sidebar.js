import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate(); // ページ遷移のための道具

  // ログアウトボタンが押されたときの処理
  const handleLogout = () => {
    localStorage.removeItem('accessToken'); // 通行証を削除
    navigate('/'); // ログインページに移動
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
        <Link to="/admin" className="page-item">
          <span className="icon">⚙️</span>
          <span className="title">管理者ページ</span>
        </Link>
      </div>

      <div className="sidebar-footer">
        {/* --- ↓↓↓ ログアウトボタンを追加 ↓↓↓ --- */}
        <button className="sidebar-button" onClick={handleLogout}>
          <span>ログアウト</span>
        </button>
        {/* --- ↑↑↑ ここまで --- */}
      </div>
    </aside>
  );
}

export default Sidebar;