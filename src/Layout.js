import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';

function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken'); // 通行証を削除
    navigate('/'); // ログインページに移動
  };

  return (
    <div>
      {/* --- ヘッダー部分 --- */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component={Link} to="/dashboard" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
            社内Wiki
          </Typography>
          <Button color="inherit" onClick={handleLogout}>ログアウト</Button>
        </Toolbar>
      </AppBar>

     <div className="container">
      {/* --- 左側にサイドバーを配置 --- */}
      <Sidebar />

      {/* --- 右側にメインコンテンツを配置 --- */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
    </div>
  );
}

export default Layout;