import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from './api';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AddIcon from '@mui/icons-material/Add';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

// 必要なAPI関数
const getDepartments = async () => {
    return api.get('/departments/'); 
};

function PageEditor({ onSaveSuccess, onCancel }) {
  const { pageId } = useParams();
  
  // 基本データState
  const [page, setPage] = useState({ title: '', content: '', allowed_department_ids: [], engineer_id: '' });
  const [departments, setDepartments] = useState([]);
  const [engineers, setEngineers] = useState([]);
  
  // ★★★ ファイル管理用State ★★★
  const [newFiles, setNewFiles] = useState([]); // 新しくアップロードするファイル
  const [existingFiles, setExistingFiles] = useState([]); // 既にサーバーにあるファイル(編集時用)
  const fileInputRef = useRef(null);

  // ステータスState
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vectorStatus, setVectorStatus] = useState(null); 
  
  const isNewPage = pageId === 'new' || !pageId; 
  const isEditMode = !isNewPage; 

  // データ取得
  const fetchPageAndDependencies = useCallback(async () => {
    setLoading(true);
    try {
      const [deptResponse, engResponse] = await Promise.all([
        getDepartments(),
        api.get('/engineers/')
      ]);
      
      setDepartments(deptResponse.data);
      setEngineers(engResponse.data);

      if (isEditMode) { 
        const response = await api.get(`/pages/${pageId}`);
        const pageData = response.data;
        
        setPage({
          title: pageData.title,
          content: pageData.content,
          allowed_department_ids: pageData.allowed_departments.map(d => d.id),
          engineer_id: pageData.engineer_id || '' // 修正: undefined対策
        });
        // ★ 既存ファイルのセット
        setExistingFiles(pageData.files || []);
      } else {
        setPage(prev => ({ ...prev, title: '', content: '', engineer_id: '' }));
      }
    } catch (err) {
      console.error('データの読み込みに失敗しました:', err);
      setError(err.response?.data?.detail || 'データの読み込みに失敗しました。'); 
    } finally {
      setLoading(false);
    }
  }, [pageId, isEditMode]);

  useEffect(() => {
    fetchPageAndDependencies();
  }, [fetchPageAndDependencies]);

  // ハンドラ: テキスト入力
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPage(prev => ({ ...prev, [name]: value }));
  };

  // ハンドラ: 部署選択
  const handleDepartmentChange = (departmentId) => {
    setPage(prev => {
      const currentIds = prev.allowed_department_ids;
      const newIds = currentIds.includes(departmentId)
        ? currentIds.filter(id => id !== departmentId)
        : [...currentIds, departmentId];
      return { ...prev, allowed_department_ids: newIds };
    });
  };

  // ★★★ ハンドラ: ファイル選択 ★★★
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      setNewFiles(prev => [...prev, ...selectedFiles]);
    }
    // 同じファイルを再度選択できるようにリセット
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ★★★ ハンドラ: 新規ファイル削除（アップロード前） ★★★
  const handleRemoveNewFile = (index) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
  };

  // ★★★ ハンドラ: 既存ファイル削除（サーバーから削除） ★★★
  const handleDeleteExistingFile = async (fileId) => {
    if (!window.confirm('このファイルを完全に削除しますか？')) return;
    try {
      await api.delete(`/files/${fileId}`);
      setExistingFiles(prev => prev.filter(f => f.id !== fileId));
    } catch (err) {
      console.error('ファイル削除エラー:', err);
      alert('ファイルの削除に失敗しました');
    }
  };

  // ★★★ 保存処理 ★★★
  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setVectorStatus(null);

    try {
      let savedPageId = pageId;

      if (isNewPage) {
        // --- 新規作成パターン (FormDataで一括送信) ---
        const formData = new FormData();
        formData.append('title', page.title);
        formData.append('content', page.content);
        
        if (page.allowed_department_ids) {
            page.allowed_department_ids.forEach(id => formData.append('allowed_department_ids', id));
        }
        if (page.engineer_id) {
            formData.append('engineer_id', page.engineer_id);
        }
        // ファイル追加
        newFiles.forEach(file => {
            formData.append('files', file);
        });

        const response = await api.post('/pages/', formData);
        savedPageId = response.data.id;

      } else {
        // --- 編集パターン (JSON更新 + 個別アップロード) ---
        
        // 1. 基本情報の更新 (PUT)
        const jsonData = {
          title: page.title,
          content: page.content,
          allowed_department_ids: page.allowed_department_ids,
          engineer_id: page.engineer_id
        };
        await api.put(`/pages/${pageId}`, jsonData);

        // 2. 新規ファイルの追加アップロード (POST)
        if (newFiles.length > 0) {
          // 複数ファイルを順番にアップロード
          for (const file of newFiles) {
            const fileData = new FormData();
            fileData.append('file', file);
            await api.post(`/pages/${pageId}/files/`, fileData);
          }
        }
      }
      
      onSaveSuccess(savedPageId);

    } catch (err) {
      console.error('保存エラー:', err);
      const errorDetail = err.response?.data?.detail;
      setError(Array.isArray(errorDetail) ? errorDetail.map(e => e.msg).join(', ') : (errorDetail || '保存中にエラーが発生しました。'));
    } finally {
      setLoading(false);
    }
  };

  // AI学習トリガー
  const handleVectorize = async (id) => {
    setVectorStatus(null);
    setLoading(true);
    try {
        // ★修正: const response = を削除し、実行だけ行うように変更
        await api.post(`/pages/${id}/vectorize`); 
        
        setVectorStatus({ 
            success: true, 
            message: 'AI学習を依頼しました。' 
        });
    } catch (error) {
        setVectorStatus({ 
            success: false, 
            message: `学習トリガー失敗: ${error.response?.data?.detail || 'エラー'}` 
        });
    } finally {
        setLoading(false);
    }
  };

  if (loading && !page.title) { // 初回ロード時のみローディング表示
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isNewPage ? <><AddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />新規Wikiページ作成</> : `ページ編集: ${page.title}`}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {vectorStatus && <Alert severity={vectorStatus.success ? "success" : "error"} sx={{ mb: 2 }}>{vectorStatus.message}</Alert>}

      <TextField
        fullWidth label="タイトル" name="title" value={page.title} onChange={handleChange} margin="normal" variant="outlined"
      />
      <TextField
        fullWidth label="コンテンツ (Markdown可)" name="content" value={page.content} onChange={handleChange} margin="normal" multiline rows={15} variant="outlined"
      />

      <TextField
        select fullWidth label="関連エンジニア" name="engineer_id" value={page.engineer_id} onChange={handleChange} margin="normal" variant="outlined"
        SelectProps={{ native: true }} InputLabelProps={{ shrink: true }}
      >
        <option value="">(選択なし)</option>
        {engineers.map((eng) => <option key={eng.id} value={eng.id}>{eng.name}</option>)}
      </TextField>

      {/* ★★★ ファイル添付エリア ★★★ */}
      <Box sx={{ mt: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>添付ファイル</Typography>
        
        {/* ファイル選択ボタン */}
        <input
            type="file"
            multiple
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
        />
        <Button
            variant="outlined"
            startIcon={<AttachFileIcon />}
            onClick={() => fileInputRef.current.click()}
            sx={{ mb: 2 }}
        >
            ファイルを追加
        </Button>

        {/* ファイルリスト表示用Paper */}
        {(existingFiles.length > 0 || newFiles.length > 0) && (
            <Paper variant="outlined" sx={{ p: 1 }}>
                <List dense>
                    {/* 既存のファイル (編集モード時) */}
                    {existingFiles.map((file) => (
                        <ListItem key={`existing-${file.id}`}>
                            <AttachFileIcon color="action" sx={{ mr: 1 }} />
                            <ListItemText 
                                primary={file.filename} 
                                secondary="アップロード済み" 
                            />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteExistingFile(file.id)}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}

                    {/* 新しく追加するファイル */}
                    {newFiles.map((file, index) => (
                        <ListItem key={`new-${index}`}>
                            <CloudUploadIcon color="primary" sx={{ mr: 1 }} />
                            <ListItemText 
                                primary={file.name} 
                                secondary={`新規追加 (${(file.size / 1024).toFixed(1)} KB)`} 
                            />
                            <ListItemSecondaryAction>
                                <IconButton edge="end" aria-label="delete" onClick={() => handleRemoveNewFile(index)}>
                                    <DeleteIcon />
                                </IconButton>
                            </ListItemSecondaryAction>
                        </ListItem>
                    ))}
                </List>
            </Paper>
        )}
      </Box>

      <Divider sx={{ my: 3 }} />

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ mb: 1 }}>閲覧権限設定</Typography>
          {departments.map(dept => (
            <FormControlLabel
              key={dept.id}
              control={<Checkbox checked={page.allowed_department_ids.includes(dept.id)} onChange={() => handleDepartmentChange(dept.id)} />}
              label={dept.name}
            />
          ))}
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            {isEditMode && (
                <Tooltip title="AI学習を強制更新">
                    <Button variant="outlined" startIcon={<AutoFixHighIcon />} onClick={() => handleVectorize(pageId)} disabled={loading} color="secondary">
                        AI学習を更新
                    </Button>
                </Tooltip>
            )}
            <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={loading} sx={{ minWidth: 100 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : '保存'}
            </Button>
            <Button variant="outlined" onClick={onCancel} disabled={loading}>キャンセル</Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PageEditor;