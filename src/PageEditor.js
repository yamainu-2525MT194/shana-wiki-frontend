import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Container, Typography, Box, TextField, Button, Paper, Grid, CircularProgress } from '@mui/material';

function PageEditor() {
  const navigate = useNavigate();
  const { pageId } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://backend-api-1060579851059.asia-northeast1.run.app';

useEffect(() => {
    const initialize = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        // ログインユーザー情報を取得
        const userResponse = await axios.get(`${API_URL}/users/me`, authHeaders);
        setCurrentUser(userResponse.data);

        // ★★★ もし編集モード (pageIdがある場合) なら、既存のページ内容を取得 ★★★
        if (pageId) {
          const pageResponse = await axios.get(`${API_URL}/pages/${pageId}`, authHeaders);
          setTitle(pageResponse.data.title);

          setContent(pageResponse.data.content);
        }
      } catch (error) {
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
      
      // ★★★ 編集モードか新規作成モードかで、APIを使い分ける ★★★
      if (pageId) {
        // 編集モード：PUTリクエスト
        await axios.put(`${API_URL}/pages/${pageId}`, pageData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('ページを更新しました！');
        navigate(`/pages/${pageId}`); // 更新後、閲覧ページに戻る
      } else {
        // 新規作成モード：POSTリクエスト
        await axios.post(`${API_URL}/pages/`, pageData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('新しいWikiページを作成しました！');
        navigate('/dashboard');
      }
    } catch (err) {
      alert("ページの保存に失敗しました。");
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
        <Typography variant="h4" component="h1" gutterBottom>
          {pageId ? 'ページを編集' : '新しいページを作成'} {/* モードに応じてタイトルを変更 */}
            </Typography>
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