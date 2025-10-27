import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './api';
import {
  Container, Typography, Box, Button, CircularProgress, Grid, Card, CardContent, CardActionArea, Pagination, Paper
} from '@mui/material';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        const [userResponse, pagesResponse] = await Promise.all([
          api.get(`/users/me`, authHeaders),
          api.get(`/pages/?skip=${(currentPage - 1) * itemsPerPage}&limit=${itemsPerPage}`, authHeaders)
        ]);
        
        // ★★★ データが存在するか確認してからセットする ★★★
        if (userResponse.data) {
            setUser(userResponse.data);
        }
        if (pagesResponse.data && pagesResponse.data.pages) {
            setPages(pagesResponse.data.pages);
            setPageCount(Math.ceil(pagesResponse.data.total / itemsPerPage));
        }

      } catch (error) {
        console.error("データの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

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
          {/* ★★★ pagesが存在し、かつ長さが0より大きい場合のみmapを実行する ★★★ */}
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
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination count={pageCount} page={currentPage} onChange={handlePageChange} color="primary" />
        </Box>
      </Box>
    </Container>
  );
}

export default DashboardPage;