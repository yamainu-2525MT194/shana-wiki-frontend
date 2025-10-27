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

       {/* --- ↓↓↓ ここからテーブル形式に変更 ↓↓↓ --- */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }} aria-label="wiki pages table">
            <TableHead>
              <TableRow>
                <TableCell>タイトル</TableCell>
                <TableCell align="right">作成日</TableCell>
                <TableCell align="right">最終更新日</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pages.length > 0 ? (
                pages.map((page) => (
                  <TableRow
                    key={page.id}
                    component={Link}
                    to={`/pages/${page.id}`}
                    hover
                    sx={{ textDecoration: 'none' }}
                  >
                    <TableCell component="th" scope="row">
                      {page.title}
                    </TableCell>
                    <TableCell align="right">
                      {new Date(page.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      {/* updated_atがなければcreated_atを表示 */}
                      {page.updated_at ? new Date(page.updated_at).toLocaleDateString() : new Date(page.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    まだページがありません。管理者が新しいページを作成できます。
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {/* --- ↑↑↑ ここまで --- */}
      </Box>
    </Container>
  );
}

export default DashboardPage;