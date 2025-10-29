import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from './api'; // api.jsからインポート
import ReactMarkdown from 'react-markdown';
import {
  Container, Typography, Box, TextField, Button, Paper, Grid,
  CircularProgress, List, ListItem, ListItemText
} from '@mui/material';
import AttachmentIcon from '@mui/icons-material/Attachment';

function PageEditor() {
  const navigate = useNavigate();
  const { pageId } = useParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState([]);

  // 編集モードかどうかを判定するフラグ
  const isEditMode = Boolean(pageId);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // ユーザー情報を取得
        const userResponse = await api.get('/users/me');
        setCurrentUser(userResponse.data);

        // 編集モードの場合、ページの既存データを取得してフォームにセット
        if (isEditMode) {
          const pageResponse = await api.get(`/pages/${pageId}`);
          setTitle(pageResponse.data.title);
          setContent(pageResponse.data.content);
        }
      } catch (error) {
        console.error("データの取得に失敗しました:", error);
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [pageId, navigate, isEditMode]);

  const handleFileChange = (event) => {
    setSelectedFiles(Array.from(event.target.files));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      alert("ユーザー情報が取得できていません。");
      return;
    }

    try {
      if (isEditMode) {
        // ★★★【最重要修正点 1】★★★
        // 編集モードの場合：PUTリクエストでデータを更新
        const updatedPage = { title, content };
        await api.put(`/pages/${pageId}`, updatedPage);
        alert('ページを更新しました！');
      } else {
        // ★★★ 新規作成モードの場合：POSTリクエストでデータとファイルを送信 ★★★
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });
        await api.post('/pages/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        alert('新しいWikiページを作成しました！');
      }
      // 成功したら、ダッシュボードに再取得を促す合図を送る
      navigate('/dashboard', { state: { refresh: true } });
    } catch (err) {
      console.error("ページの保存に失敗しました:", err);
      alert("ページの保存に失敗しました。");
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        {/* ★★★ モードによってタイトルを変更 ★★★ */}
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditMode ? 'ページを編集' : 'ページエディタ'}
        </Typography>
        <Paper component="form" onSubmit={handleSave} sx={{ p: 2 }}>
          {/* ★★★【重要修正点 2】★★★ e.value -> e.target.value に修正 */}
          <TextField label="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth margin="normal" required />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}><TextField label="内容 (Markdown)" value={content} onChange={(e) => setContent(e.target.value)} multiline rows={20} fullWidth required /></Grid>
            <Grid item xs={6}><Paper variant="outlined" sx={{ p: 2, height: '100%' }}><Typography variant="h5" gutterBottom>プレビュー</Typography><Box sx={{ maxHeight: 480, overflow: 'auto' }}><ReactMarkdown>{content}</ReactMarkdown></Box></Paper></Grid>
          </Grid>
          
          {/* ★★★ 新規作成モードの時だけファイル添付機能を表示 ★★★ */}
          {!isEditMode && (
            <>
              <Button
                variant="contained" component="label" startIcon={<AttachmentIcon />} sx={{ mt: 2 }}
              >
                ファイルを添付
                <input type="file" hidden multiple onChange={handleFileChange} />
              </Button>
              <List>
                {selectedFiles.map((file, index) => (
                  <ListItem key={index}><ListItemText primary={file.name} /></ListItem>
                ))}
              </List>
            </>
          )}

          {/* ★★★ モードによってボタンのテキストを変更 ★★★ */}
          <Button type="submit" variant="contained" sx={{ mt: 3 }}>
            {isEditMode ? 'ページを更新する' : 'ページを保存する'}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}

export default PageEditor;