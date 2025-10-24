import React, { useState, useEffect, LINK } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // useNavigateとLinkを追加
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Container, Typography, Box, Paper, CircularProgress, Button } from '@mui/material'; // Buttonを追加

function WikiPage() {
  const { pageId } = useParams();
  const navigate = useNavigate(); // ページ遷移のための道具
  const [page, setPage] = useState(null);
  const [user, setUser] = useState(null); // ← ★★★ログインユーザー情報を記憶する★★★
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://backend-api-1060579851059.asia-northeast1.run.app'; // ★重要★ あなたのバックエンドURL

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        // ★★★ ページ情報とユーザー情報を同時に取得する ★★★
        const [pageResponse, userResponse] = await Promise.all([
          axios.get(`${API_URL}/pages/${pageId}`, authHeaders),
          axios.get(`${API_URL}/users/me`, authHeaders)
        ]);
        
        setPage(pageResponse.data);
        setUser(userResponse.data);

      } catch (error) {
        console.error("データの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [pageId]);

  // --- ↓↓↓ ページ削除処理を追加 ↓↓↓ ---
  const handleDelete = async () => {
    if (window.confirm(`本当にこのページ「${page.title}」を削除しますか？`)) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`${API_URL}/pages/${pageId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('ページを削除しました。');
        navigate('/dashboard'); // 削除後、ダッシュボードに移動
      } catch (err) {
        console.error("ページの削除に失敗しました:", err);
        alert("ページの削除に失敗しました。");
      }
    }
  };
  // --- ↑↑↑ ページ削除処理を追加 ↑↑↑ ---

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  }

  if (!page) {
    return <Typography>ページが見つかりません。</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {page.title}
        </Typography>

        {/* --- ↓↓↓ 管理者用ボタンを追加 ↓↓↓ --- */}
        {user && user.role === 'admin' && (
          <Box sx={{ mb: 2 }}>
            <Button variant="contained" color="secondary" onClick={handleDelete}>
              このページを削除
            </Button>
            <Button component={Link} to={`/pages/edit/${page.id}`} variant="contained" sx={{ ml: 2 }}>
              このページを編集
            </Button>
          </Box>
        )}
        {/* --- ↑↑↑ 管理者用ボタンを追加 ↑↑↑ --- */}

        <Paper sx={{ p: 3 }}>
          <ReactMarkdown>{page.content}</ReactMarkdown>
        </Paper>
      </Box>
    </Container>
  );
}

export default WikiPage;