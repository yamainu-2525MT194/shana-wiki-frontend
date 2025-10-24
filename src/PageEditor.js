import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Container, Typography, Box, TextField, Button, Paper, Grid } from '@mui/material';

function PageEditor() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://backend-api-1060579851059.asia-northeast1.run.app'; // ★重要★ あなたのバックエンドURL

// ★★★ ページが表示された時に、ログインユーザーの情報を取得する ★★★
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
      // このページにアクセスできるのは管理者だけなので、author_idはバックエンド側で設定することも可能ですが、
      // ここではフロントエンドでログインユーザー情報を取得して設定します。
      // 簡単にするため、今回は固定の管理者IDを仮定します。
      // TODO: /users/me から取得したIDを使うように後で修正
      const author_id = 1; // 仮の管理者ID

      const newPage = { title, content, author_id };
      
      await axios.post(`${API_URL}/pages/`, newPage, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('新しいWikiページを作成しました！');
      navigate('/dashboard'); // 保存後、ダッシュボードに移動
    } catch (err) {
      console.error("ページの作成に失敗しました:", err);
      alert("ページの作成に失敗しました。");
    }
  };

  return (
    <Container maxWidth="xl"> {/* 横幅を広くする */}
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ページエディタ
        </Typography>
        <Paper component="form" onSubmit={handleSave} sx={{ p: 2 }}>
          <TextField 
            label="タイトル" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            fullWidth 
            margin="normal" 
            required 
          />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* --- ↓↓↓ 左半分：Markdown入力欄 ↓↓↓ --- */}
            <Grid item xs={6}>
              <TextField
                label="内容 (Markdown)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                multiline
                rows={20}
                fullWidth
                required
              />
            </Grid>
            {/* --- ↓↓↓ 右半分：リアルタイムプレビュー ↓↓↓ --- */}
            <Grid item xs={6}>
              <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                <Typography variant="h5" gutterBottom>プレビュー</Typography>
                <Box sx={{ maxHeight: 480, overflow: 'auto' }}>
                  <ReactMarkdown>{content}</ReactMarkdown>
                </Box>
              </Paper>
            </Grid>
          </Grid>
          <Button type="submit" variant="contained" sx={{ mt: 3 }}>
            ページを保存する
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}

export default PageEditor;