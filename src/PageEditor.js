import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Container, Typography, Box, TextField, Button, Paper, Grid, CircularProgress } from '@mui/material';

function PageEditor() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://backend-api-1060579851059.asia-northeast1.run.app';

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(response.data);
      } catch (error) {
        console.error("ユーザー情報の取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCurrentUser();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("ユーザー情報が取得できていません。");
      return;
    }
    try {
      const token = localStorage.getItem('accessToken');
      const newPage = { title, content, author_id: currentUser.id };
      
      await axios.post(`${API_URL}/pages/`, newPage, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('新しいWikiページを作成しました！');
      navigate('/dashboard');
    } catch (err) {
      console.error("ページの作成に失敗しました:", err);
      alert("ページの作成に失敗しました。");
    }
  };

  // --- ↓↓↓ これが重要な修正です ↓↓↓ ---
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  }
  // --- ↑↑↑ これが重要な修正です ↑↑↑ ---

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>ページエディタ</Typography>
        <Paper component="form" onSubmit={handleSave} sx={{ p: 2 }}>
          <TextField label="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth margin="normal" required />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}><TextField label="内容 (Markdown)" value={content} onChange={(e) => setContent(e.target.value)} multiline rows={20} fullWidth required /></Grid>
            <Grid item xs={6}><Paper variant="outlined" sx={{ p: 2, height: '100%' }}><Typography variant="h5" gutterBottom>プレビュー</Typography><Box sx={{ maxHeight: 480, overflow: 'auto' }}><ReactMarkdown>{content}</ReactMarkdown></Box></Paper></Grid>
          </Grid>
          <Button type="submit" variant="contained" sx={{ mt: 3 }}>ページを保存する</Button>
        </Paper>
      </Box>
    </Container>
  );
}

export default PageEditor;