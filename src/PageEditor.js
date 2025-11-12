import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import api from './api'; // ★apiインスタンスのみを使用するように統一
import {
  Container, Typography, Box, TextField, Button, Paper, Grid,
  CircularProgress, List, ListItem, ListItemText, FormGroup,
  FormControlLabel, Checkbox, FormLabel, FormControl, InputLabel, Select, MenuItem
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

  // 権限設定のためのState
  const [departments, setDepartments] = useState([]);
  const [selectedDepartments, setSelectedDepartments] = useState(new Set());

  // ★★★ 追加: エンジニア紐付け用State ★★★
  const [engineers, setEngineers] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // ユーザー、部署、★エンジニア一覧 をまとめて取得
        const [userResponse, deptsResponse, engsResponse] = await Promise.all([
          api.get('/users/me'),
          api.get('/departments/'),
          api.get('/engineers/') // ★追加
        ]);
        setCurrentUser(userResponse.data);
        setDepartments(deptsResponse.data);
        setEngineers(engsResponse.data); // ★追加

        // 編集モードの場合、ページの既存データを取得
        if (isEditMode) {
          const pageResponse = await api.get(`/pages/${pageId}`);
          setTitle(pageResponse.data.title);
          setContent(pageResponse.data.content);
          
          // 権限の復元
          const initialSelected = new Set(pageResponse.data.allowed_departments.map(dept => dept.id));
          setSelectedDepartments(initialSelected);

          // ★追加: エンジニア紐付けの復元
          if (pageResponse.data.engineer_id) {
            setSelectedEngineer(pageResponse.data.engineer_id);
          }
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

    if (!currentUser) {
      alert("ユーザー情報が取得できていません。再度ログインしてください。");
      return;
    }

    const deptIdArray = Array.from(selectedDepartments);

    try {
      // FormDataを作成 (新規・編集共通で使える部分はまとめる)
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      
      deptIdArray.forEach(id => {
        formData.append('allowed_department_ids', id);
      });

      // ★★★ 追加: エンジニアIDの送信 ★★★
      if (selectedEngineer) {
        formData.append('engineer_id', selectedEngineer);
      }

      // ファイルは編集時も追加アップロード可能とするならここに追加
      // (※バックエンドの update_page がファイルを受け取る仕様かによりますが、今回は新規作成時メインとします)
      if (!isEditMode) {
         selectedFiles.forEach(file => {
          formData.append('files', file);
        });
      }

      if (isEditMode) {
        // --- 編集モード ---
        // バックエンドのスキーマに合わせてJSONで送るか、FormDataで統一するか検討が必要ですが
        // main.pyの update_existing_page は schemas.PageCreate を受け取るのでJSONが適しています
        // ただし、今回は統一感を出すため updatePage 側も修正済み前提で JSON オブジェクトを送ります
        const updatePayload = {
            title,
            content,
            allowed_department_ids: deptIdArray,
            engineer_id: selectedEngineer || null // ★追加
        };
        await api.put(`/pages/${pageId}`, updatePayload);
        alert('ページを更新しました！');
      } else {
        // --- 新規作成モード ---
        // create_page_with_files は Formデータを受け取る
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
          
          {/* ★★★ 追加: エンジニア選択エリア ★★★ */}
          <FormControl fullWidth margin="normal">
            <InputLabel id="engineer-select-label">関連エンジニア（任意）</InputLabel>
            <Select
                labelId="engineer-select-label"
                value={selectedEngineer}
                label="関連エンジニア（任意）"
                onChange={(e) => setSelectedEngineer(e.target.value)}
            >
                <MenuItem value="">
                    <em>関連なし</em>
                </MenuItem>
                {engineers.map((eng) => (
                    <MenuItem key={eng.id} value={eng.id}>
                        {eng.name} ({eng.status})
                    </MenuItem>
                ))}
            </Select>
          </FormControl>

          {/* 権限設定セクション */}
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