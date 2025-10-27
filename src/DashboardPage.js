import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
// --- ↓↓↓ MUIの部品を追加・変更 ↓↓↓ ---
import {
  Container, Typography, Box, Button, CircularProgress, Grid, Card, CardContent, CardActionArea, Pagination
} from '@mui/material';
// --- ↑↑↑ MUIの部品を追加・変更 ↑↑↑ ---

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // 1ページあたりのカード数

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
          // ページネーションのためにskipとlimitを渡す
          axios.get(`${API_URL}/pages/?skip=${(currentPage - 1) * itemsPerPage}&limit=${itemsPerPage}`, authHeaders)
        ]);
        
        setUser(userResponse.data);
        setPages(pagesResponse.data);
        setPageCount(Math.ceil(pagesResponse.data.total / itemsPerPage));

      } catch (error) {
        console.error("データの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]); // currentPageが変わるたびにデータを再取得

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

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

    <Grid container spacing={3}>
          {pages.map((page) => (
            <Grid item xs={12} sm={6} md={4} key={page.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea component={Link} to={`/pages/${page.id}`} sx={{ flexGrow: 1 }}>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {page.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {page.content}
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
          ))}
        </Grid>
        
        {/* --- ↓↓↓ ページネーションを追加 ↓↓↓ --- */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination count={pageCount} page={currentPage} onChange={handlePageChange} color="primary" />
        </Box>
        {/* --- ↑↑↑ ここまで --- */}
      </Box>
    </Container>
  );
}

export default DashboardPage;