import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from './api'; // ← ★★★ axiosからapiに変更 ★★★
import ReactMarkdown from 'react-markdown';
import { Typography, Box, TextField, Button, Paper, Grid, CircularProgress } from '@mui/material';

function PageEditor() {
  const navigate = useNavigate();
  const { pageId } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // const API_URL = '...'; // ← ★★★ この行は削除 ★★★

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        // ★★★ axios → api に変更し、URLをシンプルに ★★★
        const userResponse = await api.get('/users/me', authHeaders);
        setCurrentUser(userResponse.data);

        if (pageId) {
          const pageResponse = await api.get(`/pages/${pageId}`, authHeaders);
          setTitle(pageResponse.data.title);
          setContent(pageResponse.data.content);
        }
      } catch (error) {
        // 401エラーはapi.jsが自動で処理するので、ここでは一般的なエラー処理のみ
        console.error("データの初期化に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };
    initialize();
  }, [pageId]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) { return; }
    try {
      const token = localStorage.getItem('accessToken');
      const pageData = { title, content, author_id: currentUser.id };
      
      if (pageId) {
        await api.put(`/pages/${pageId}`, pageData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('ページを更新しました！');
        navigate(`/pages/${pageId}`);
      } else {
        await api.post('/pages/', pageData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('新しいWikiページを作成しました！');
        navigate('/dashboard');
      }
    } catch (err) {
      alert("ページの保存に失敗しました。");
    }
  };
  
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ my: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {pageId ? 'ページを編集' : '新しいページを作成'}
      </Typography>
      <Paper component="form" onSubmit={handleSave} sx={{ p: 2 }}>
        <TextField label="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth margin="normal" required />
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}><TextField label="内容 (Markdown)" value={content} onChange={(e) => setContent(e.target.value)} multiline rows={20} fullWidth required /></Grid>
          <Grid item xs={12} md={6}><Paper variant="outlined" sx={{ p: 2, height: '100%' }}><Typography variant="h6" gutterBottom>プレビュー</Typography><Box sx={{ maxHeight: 525, overflow: 'auto' }}><ReactMarkdown>{content}</ReactMarkdown></Box></Paper></Grid>
        </Grid>
        <Button type="submit" variant="contained" sx={{ mt: 3 }}>ページを保存する</Button>
      </Paper>
    </Box>
  );
}

export default PageEditor;