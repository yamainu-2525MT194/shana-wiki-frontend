import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ArticleIcon from '@mui/icons-material/Article';

function Sidebar({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token'); // 念のため両方削除
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

        <Link to="/incidents" className="page-item">
          <span className="icon">⚠️</span>
          <span className="title">トラブル管理</span>
        </Link>

        <Link to="/wiki" className="page-item">
          <span className="icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArticleIcon fontSize="small" />
          </span>
          <span className="title">Wiki一覧</span>
        </Link>

        <Link to="/chat" className="page-item">
          <span className="icon">🤖</span>
          <span className="title">AIチャット</span>
        </Link>

        {/* 修正箇所: 既存のデザインスタイルに合わせました */}
        <Link to="/opportunities/analyze" className="page-item">
          <span className="icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AutoFixHighIcon fontSize="small" />
          </span>
          <span className="title">案件AI分析</span>
        </Link>

        <Link to="/admin" className="page-item">
          <span className="icon">📝</span>
          <span className="title">各種登録ページ</span>
        </Link>
        

        {/* user が存在し、かつ role が 'admin' の場合のみ、以下のリンク群を表示 */}
        {user && user.role === 'admin' && (
          <> {/* 複数のリンクをグループ化 */}
            <Link to="/users/manage" className="page-item">
              <span className="icon">👥</span>
              <span className="title">ユーザー管理</span>
            </Link>
            
            <Link to="/admin/login-history" className="page-item">
              <span className="icon">📜</span> 
              <span className="title">ログイン履歴</span>
            </Link>

            <Link to="/admin/activity-logs" className="page-item">
              <span className="icon">📊</span> 
              <span className="title">活動履歴</span>
            </Link>
          </>
        )}

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