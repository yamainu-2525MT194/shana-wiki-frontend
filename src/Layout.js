import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, TextField, InputAdornment, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search'; // ★★★ 検索アイコンをインポート ★★★
import { Outlet, Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

function Layout() {
  const navigate = useNavigate();
  // ★★★ 検索キーワードを管理するState ★★★
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleLogout = () => { /* 変更なし */ };

  // ★★★ 検索実行時の処理 ★★★
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      // 検索結果ページにキーワードを渡して遷移
      navigate(`/search?q=${searchKeyword}`);
    }
  };

  return (
    <div>
      {/* --- ヘッダー部分 --- */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component={Link} to="/dashboard" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
            社内Wiki
          </Typography>
          <Box component="form" onSubmit={handleSearch} sx={{ flexGrow: 1, mx: 2 }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Wiki内を検索..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              sx={{ 
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.25)' },
                },
                '& .MuiOutlinedInput-input': { color: 'white' }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'white' }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
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