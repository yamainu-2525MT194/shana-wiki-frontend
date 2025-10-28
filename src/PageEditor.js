import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {
  Container, Typography, Box, TextField, Button, Paper, Grid,
  CircularProgress, List, ListItem, ListItemText
} from '@mui/material';
import AttachmentIcon from '@mui/icons-material/Attachment';

function PageEditor() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ★★★ アップロードするファイル一覧を保持するstateを追加 ★★★
  const [selectedFiles, setSelectedFiles] = useState([]);

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

  // ★★★ ファイルが選択されたときにstateを更新する関数 ★★★
  const handleFileChange = (event) => {
    // event.target.filesはFileListなので、Arrayに変換する
    setSelectedFiles(Array.from(event.target.files));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("ユーザー情報が取得できていません。");
      return;
    }

    // ★★★ ファイルとテキストを一緒に送るためにFormDataを使用 ★★★
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    
    // 選択された各ファイルをFormDataに追加する
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`${API_URL}/pages/`, formData, {
        headers: {
          // ファイルを送信する際は 'multipart/form-data' を指定
          'Content-Type': 'multipart/form-data', 
          Authorization: `Bearer ${token}`
        }
      });

      alert('新しいWikiページを作成しました！');
      navigate('/dashboard', { state: { refresh: true } });
    } catch (err) {
      console.error("ページの作成に失敗しました:", err);
      alert("ページの作成に失敗しました。");
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  }

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
          
          {/* ★★★ ファイル選択ボタンと選択済みファイル一覧を追加 ★★★ */}
          <Button
            variant="contained"
            component="label"
            startIcon={<AttachmentIcon />}
            sx={{ mt: 2 }}
          >
            ファイルを添付
            <input type="file" hidden multiple onChange={handleFileChange} />
          </Button>

          <List>
            {selectedFiles.map((file, index) => (
              <ListItem key={index}>
                <ListItemText primary={file.name} />
              </ListItem>
            ))}
          </List>

          <Button type="submit" variant="contained" sx={{ mt: 3 }}>ページを保存する</Button>
        </Paper>
      </Box>
    </Container>
  );
}

export default PageEditor;