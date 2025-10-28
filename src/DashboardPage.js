import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from './api';
import {
  Container, Typography, Box, Button, CircularProgress, Paper,
  List, ListItem, ListItemText, ListItemButton, Divider // ★★★ GridとCardの代わりにList関連をインポート ★★★
} from '@mui/material';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  // ★★★ ページネーションは一旦不要になるので関連コードを削除 ★★★
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  // const itemsPerPage = 9;

  const location = useLocation();

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

        // ★★★ ページネーションをやめ、全件取得するAPIに変更（後ほどバックエンドも修正） ★★★
        const [userResponse, pagesResponse] = await Promise.all([
          api.get(`/users/me`, authHeaders),
          api.get(`/pages/all`, authHeaders) 
        ]);
        
        if (userResponse.data) {
          setUser(userResponse.data);
        }
        // ★★★ レスポンスの形式が変わることを想定 ★★★
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
  }, [location.state]); 

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

        {/* ★★★ ここから下がカード表示からリスト表示への大きな変更点 ★★★ */}
        <Paper>
          <List>
            {pages && pages.length > 0 ? (
              pages.map((page, index) => (
                <React.Fragment key={page.id}>
                  <ListItem disablePadding>
                    <ListItemButton component={Link} to={`/pages/${page.id}`}>
                      <ListItemText
                        primary={page.title}
                        secondary={`更新日: ${new Date(page.updated_at).toLocaleDateString()} | 作成者: ${page.author ? page.author.name : '不明'}`}
                      />
                    </ListItemButton>
                  </ListItem>
                  {/* 最後の項目以外には下に線を入れる */}
                  {index < pages.length - 1 && <Divider />}
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="まだページがありません。管理者が新しいページを作成できます。" sx={{ textAlign: 'center' }} />
              </ListItem>
            )}
          </List>
        </Paper>
        {/* ★★★ ページネーションの表示を削除 ★★★ */}
      </Box>
    </Container>
  );
}

export default DashboardPage;