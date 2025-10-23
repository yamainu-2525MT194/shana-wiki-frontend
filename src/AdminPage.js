import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Typography, Box, Paper, List, ListItem, ListItemButton, ListItemText 
} from '@mui/material'; // MUIの部品を追加

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [pages, setPages] = useState([]); // ← ★★★ページ一覧を記憶する変数を追加★★★
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

        // ユーザー情報とページ一覧を同時に取得する
        const [userResponse, pagesResponse] = await Promise.all([
          axios.get(`${API_URL}/users/me`, authHeaders),
          axios.get(`${API_URL}/pages/`, authHeaders) // ← ★★★ページ一覧を取得★★★
        ]);

        setUser(userResponse.data);
        setPages(pagesResponse.data); // ← ★★★取得したページ一覧を記憶★★★

      } catch (error) {
        console.error("データの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p>読み込み中...</p>;
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

        {/* --- ↓↓↓ ページ一覧の表示を追加 ↓↓↓ --- */}
        <Typography variant="h5" component="h2" gutterBottom>
          Wikiページ一覧
        </Typography>
        <Paper>
          <List>
            {pages.map((page) => (
              <ListItem key={page.id} disablePadding>
                <ListItemButton>
                  <ListItemText primary={page.title} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
        {/* --- ↑↑↑ ページ一覧の表示を追加 ↑↑↑ --- */}

      </Box>
    </Container>
  );
}

export default DashboardPage;