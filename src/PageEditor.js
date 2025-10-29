import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from './api';
import ReactMarkdown from 'react-markdown';
import {
  Container, Typography, Box, TextField, Button, Paper, Grid,
  CircularProgress, List, ListItem, ListItemText, FormGroup,
  FormControlLabel, Checkbox, FormLabel // チェックボックス用のコンポーネント
} from '@mui/material';
import AttachmentIcon from '@mui/icons-material/Attachment';

function PageEditor() {
  const navigate = useNavigate();
  const { pageId } = useParams();

  // ページ内容のState
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // コンポーネントの状態管理State
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isEditMode = Boolean(pageId);

  // ファイルアップロードのState
  const [selectedFiles, setSelectedFiles] = useState([]);

  // ★★★ 権限設定のための新しいState ★★★
  const [departments, setDepartments] = useState([]); // 利用可能な全部署を保持
  const [selectedDepartments, setSelectedDepartments] = useState(new Set()); // 選択された部署のIDを保持

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // ユーザー情報と全部署リストを同時に取得
        const [userResponse, deptsResponse] = await Promise.all([
          api.get('/users/me'),
          api.get('/departments/')
        ]);
        setCurrentUser(userResponse.data);
        setDepartments(deptsResponse.data);

        // 編集モードの場合、ページの既存データを取得
        if (isEditMode) {
          const pageResponse = await api.get(`/pages/${pageId}`);
          setTitle(pageResponse.data.title);
          setContent(pageResponse.data.content);
          // 既に権限が付与されている部署のチェックボックスをあらかじめ選択状態にする
          const initialSelected = new Set(pageResponse.data.allowed_departments.map(dept => dept.id));
          setSelectedDepartments(initialSelected);
        }
      } catch (error) {
        console.error("初期データの取得に失敗しました:", error);
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

  // ★★★ チェックボックス変更時の新しいハンドラ ★★★
  const handleDeptChange = (event) => {
    const deptId = parseInt(event.target.name, 10);
    const newSelected = new Set(selectedDepartments);
    if (event.target.checked) {
      newSelected.add(deptId);
    } else {
      newSelected.delete(deptId);
    }
    setSelectedDepartments(newSelected);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const deptIdArray = Array.from(selectedDepartments);

    try {
      if (isEditMode) {
        // --- 編集モード ---
        const updatedPage = {
          title,
          content,
          allowed_department_ids: deptIdArray
        };
        await api.put(`/pages/${pageId}`, updatedPage);
        alert('ページを更新しました！');
      } else {
        // --- 新規作成モード ---
        const formData = new FormData();
        formData.append('title', title);
        formData.append('content', content);
        // 各部署IDをフォームデータに追加
        deptIdArray.forEach(id => {
          formData.append('allowed_department_ids', id);
        });
        selectedFiles.forEach(file => {
          formData.append('files', file);
        });
        await api.post('/pages/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        alert('新しいWikiページを作成しました！');
      }
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
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditMode ? 'ページを編集' : 'ページを作成'}
        </Typography>
        <Paper component="form" onSubmit={handleSave} sx={{ p: 3 }}>
          <TextField label="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth margin="normal" required />
          
          {/* ★★★ 権限設定のための新しいセクション ★★★ */}
          <Box sx={{ my: 2 }}>
            <FormLabel component="legend">閲覧可能な部署</FormLabel>
            <Typography variant="caption" display="block" color="textSecondary">
              部署を何も選択しない場合、全員が閲覧できます。
            </Typography>
            <FormGroup row>
              {departments.map((dept) => (
                <FormControlLabel
                  key={dept.id}
                  control={
                    <Checkbox
                      checked={selectedDepartments.has(dept.id)}
                      onChange={handleDeptChange}
                      name={String(dept.id)}
                    />
                  }
                  label={dept.name}
                />
              ))}
            </FormGroup>
          </Box>
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}><TextField label="内容 (Markdown)" value={content} onChange={(e) => setContent(e.target.value)} multiline rows={20} fullWidth required /></Grid>
            <Grid item xs={12} md={6}><Paper variant="outlined" sx={{ p: 2, height: '100%' }}><Typography variant="h5" gutterBottom>プレビュー</Typography><Box sx={{ maxHeight: 525, overflow: 'auto' }}><ReactMarkdown>{content}</ReactMarkdown></Box></Paper></Grid>
          </Grid>
          
          {!isEditMode && (
            <Box sx={{ mt: 2 }}>
              <Button variant="contained" component="label" startIcon={<AttachmentIcon />}>
                ファイルを添付
                <input type="file" hidden multiple onChange={handleFileChange} />
              </Button>
              <List>
                {selectedFiles.map((file, index) => (
                  <ListItem key={index} dense><ListItemText primary={file.name} /></ListItem>
                ))}
              </List>
            </Box>
          )}

          <Button type="submit" variant="contained" sx={{ mt: 3 }}>
            {isEditMode ? 'ページを更新' : 'ページを保存'}
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}

export default PageEditor;