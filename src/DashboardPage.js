import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
// --- ↓↓↓ MUIの部品を正しく全てインポート ↓↓↓ ---
import {
  Container, Typography, Box, Paper, List, ListItem, ListItemButton, ListItemText, Button, CircularProgress
} from '@mui/material';
// --- ↑↑↑ MUIの部品を正しく全てインポート ↑↑↑ ---

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [pages, setPages] = useState([]); // ← ページ一覧を記憶する変数
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://backend-api-1060579851059.asia-northeast1.run.app'; // ★重要★ あなたのバックエンドURL

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setLoading(false);
          return;
        }
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        // ★★★ ユーザー情報とページ一覧を同時に取得する ★★★
        const [userResponse, pagesResponse] = await Promise.all([
          axios.get(`${API_URL}/users/me`, authHeaders),
          axios.get(`${API_URL}/pages/`, authHeaders)
        ]);
        
        setUser(userResponse.data);
        setPages(pagesResponse.data);

      } catch (error) {
        console.error("データの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    // MUIの見栄えの良いローディング表示
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ようこそ、{user ? user.name : 'ゲスト'}さん！
        </Typography>
        
        {user && user.role === 'admin' && (
          <Button component={Link} to="/admin" variant="contained" color="secondary" sx={{ mb: 4 }}>
            管理者ページへ
          </Button>
        )}

        {/* --- ↓↓↓ ここに .map function があります ↓↓↓ --- */}
        <Typography variant="h5" component="h2" gutterBottom>
          Wikiページ一覧
        </Typography>
        <Paper>
          <List>
            {pages.length > 0 ? (
              pages.map((page) => (
                <ListItem key={page.id} disablePadding>
                  {/* ★★★ ここをクリック可能なリンクに修正 ★★★ */}
                  <ListItemButton component={Link} to={`/pages/${page.id}`}>
                    <ListItemText primary={page.title} />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="まだページがありません。" />
              </ListItem>
            )}
          </List>
        </Paper>
        {/* --- ↑↑↑ ここまで --- */}

      </Box>
    </Container>
  );
}

export default DashboardPage;