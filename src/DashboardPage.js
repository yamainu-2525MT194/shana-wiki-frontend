import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './api';
import {
  Container, Typography, Box, Button, CircularProgress, Grid, Card, CardContent, CardActionArea, Paper
} from '@mui/material';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setLoading(false);
          return;
        }
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        // ユーザー情報と、"全ての"ページ一覧を同時に取得する
        const [userResponse, pagesResponse] = await Promise.all([
          api.get(`/users/me`, authHeaders),
          api.get(`/pages/`, authHeaders) // ← クエリパラメータを削除
        ]);
        
        if (userResponse.data) {
          setUser(userResponse.data);
        }
        // ★★★ バックエンドからの応答が、単純なリストに戻ったので、そのままセットする ★★★
        if (pagesResponse.data) {
          setPages(pagesResponse.data);
        } else {
          setPages([]);
        }
      } catch (error) {
        console.error("データの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // currentPageに依存しないので、空の配列に戻す

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ようこそ、{user ? user.name : 'ゲスト'}さん！
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            Wikiページ一覧
          </Typography>
          {user && user.role === 'admin' && (
             <Button component={Link} to="/pages/new" variant="contained">
               新しいページを作成
             </Button>
          )}
        </Box>

        <Grid container spacing={3}>
          {pages && pages.length > 0 ? (
            pages.map((page) => (
              <Grid item xs={12} sm={6} md={4} key={page.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardActionArea component={Link} to={`/pages/${page.id}`} sx={{ flexGrow: 1 }}>
                    <CardContent>
                      <Typography gutterBottom variant="h5" component="div">
                        {page.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{
                        overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                        WebkitLineClamp: '3', WebkitBoxOrient: 'vertical',
                      }}>
                        {page.content.replace(/[#*`]/g, '')}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                  {page.updated_at && (
                    <Box sx={{ p: 2, pt: 0 }}>
                       <Typography variant="caption" color="text.secondary">
                         更新日: {new Date(page.updated_at).toLocaleDateString()}
                       </Typography>
                    </Box>
                  )}
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
        
        {/* ★★★ ページネーションを削除 ★★★ */}
      </Box>
    </Container>
  );
}

export default DashboardPage;