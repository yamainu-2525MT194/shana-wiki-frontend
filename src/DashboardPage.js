import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
// --- ↓↓↓ MUIの部品を追加・変更 ↓↓↓ ---
import {
  Container, Typography, Box, Paper, Button, CircularProgress, Grid, Card, CardContent, CardActionArea
} from '@mui/material';
// --- ↑↑↑ MUIの部品を追加・変更 ↑↑↑ ---

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://backend-api-1060579851059.asia-northeast1.run.app';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setLoading(false);
          return;
        }
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

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
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg"> {/* 横幅を少し広くする */}
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ようこそ、{user ? user.name : 'ゲスト'}さん！
        </Typography>
        
        {user && user.role === 'admin' && (
          <Button component={Link} to="/admin" variant="contained" color="secondary" sx={{ mb: 4 }}>
            管理者ページへ
          </Button>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Wikiページ一覧
          </Typography>
          {user && user.role === 'admin' && ( // 管理者のみ作成ボタンを表示
             <Button component={Link} to="/pages/new" variant="contained">
               新しいページを作成
             </Button>
          )}
        </Box>

        {/* --- ↓↓↓ ここからカード型レイアウトに変更 ↓↓↓ --- */}
        <Grid container spacing={3}>
          {pages.length > 0 ? (
            pages.map((page) => (
              <Grid item xs={12} sm={6} md={4} key={page.id}>
                <Card sx={{ height: '100%' }}>
                  <CardActionArea component={Link} to={`/pages/${page.id}`} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography gutterBottom variant="h5" component="div">
                        {page.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: '3', // 3行まで表示
                        WebkitBoxOrient: 'vertical',
                      }}>
                        {page.content}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography>まだページがありません。管理者が新しいページを作成できます。</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
        {/* --- ↑↑↑ ここまで --- */}

      </Box>
    </Container>
  );
}

export default DashboardPage;