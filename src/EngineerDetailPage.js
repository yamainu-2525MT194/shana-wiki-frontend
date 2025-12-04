import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from './api'; // ★これを使います
import {
  Container, Typography, Box, Paper, CircularProgress, Button, Grid, Chip,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Alert,
  Input,
  Divider,
  List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SmartToyIcon from '@mui/icons-material/SmartToy';

function EngineerDetailPage() {
  const { engineerId } = useParams();
  const [engineer, setEngineer] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ status: '', skills: '', memo: '' });
  
  // ファイルアップロード関連のState
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);
  
  const fetchEngineerDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/engineers/${engineerId}`); 
      setEngineer(response.data);
      setEditData({
        status: response.data.status,
        skills: response.data.skills || '',
        memo: response.data.memo || '' 
      });
    } catch (error) {
      console.error("エンジニア詳細の取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  }, [engineerId]);

  useEffect(() => {
    fetchEngineerDetails();
  }, [fetchEngineerDetails]);
  
  // ファイル変更ハンドラ
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type !== 'application/pdf') {
        setUploadResult({ success: false, message: 'PDFファイルを選択してください。' });
        setSelectedFile(null);
    } else {
        setSelectedFile(file);
        setUploadResult(null);
    }
  };

  // ★★★ 修正箇所：アップロード実行ハンドラ ★★★
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    // ★ 削除: トークン取得やURLの手動設定は不要です (api.jsが処理します)
    // const token = localStorage.getItem('accessToken');
    // const apiUrl = 'http://localhost:8000'; 

    try {
        // ★ 変更: api.post (axios) を使用
        // api.js でBaseURLが設定されているので、パスだけでOKです
        const response = await api.post(`/engineers/${engineerId}/upload-skill-sheet`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data', // axiosでファイル送る時はこれが必要な場合がある
                // Authorizationヘッダーはapi.jsのinterceptorが自動付与します
            }
        });

        // axiosの場合、response.ok ではなく status で判定、データは response.data
        if (response.status === 200 || response.status === 202) {
            const data = response.data;
            setUploadResult({ 
                success: true, 
                message: `PDF解析に成功し、AIベクトルを更新しました。新しいステータス: ${data.new_status}` 
            });
            fetchEngineerDetails(); 
        } 
    } catch (error) {
        // axiosのエラーハンドリング
        console.error("Upload error:", error);
        const errorMessage = error.response?.data?.detail || 'アップロードに失敗しました。';
        setUploadResult({ success: false, message: `アップロード失敗: ${errorMessage}` });
    } finally {
        setUploading(false);
        setSelectedFile(null);
        if (fileInputRef.current) {
             fileInputRef.current.value = null;
        }
    }
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await Promise.all([
        api.put(`/engineers/update-status/${engineerId}`, { status: editData.status }),
        api.put(`/engineers/${engineerId}`, { 
          name: engineer.name,
          skills: editData.skills, 
          memo: editData.memo
        })
      ]);
      alert('エンジニア情報を更新しました。');
      setIsEditing(false); 
      fetchEngineerDetails(); 
    } catch (error) {
      console.error("エンジニアの更新に失敗しました:", error);
      alert('エンジニアの更新に失敗しました。');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      status: engineer.status,
      skills: engineer.skills || '',
      memo: engineer.memo || ''
    });
  };

  const formatDate = (dateString) => {
  if (!dateString) return '不明';
  return new Date(dateString).toLocaleString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
};

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  }

  if (!engineer) {
    return <Typography>エンジニアが見つかりません。</Typography>;
  }

  const hasSkills = engineer.skills && engineer.skills.length > 0;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          エンジニア詳細: {engineer.name}
        </Typography>

        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Box>
             <Button component={Link} to="/engineers" sx={{ mr: 1 }}>&larr; エンジニア一覧に戻る</Button>
          </Box>
          <Box>
            {isEditing ? (
              <>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>保存</Button>
                <Button onClick={handleCancel} sx={{ ml: 1 }}>キャンセル</Button>
              </>
            ) : (
              <Button variant="contained" startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>このエンジニアを編集</Button>
            )}
          </Box>
        </Box>

        <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>スキルシート自動解析 (PDF)</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    PDFをアップロードすると、スキルとベクトル情報が自動更新されます。
                </Typography>
                
                {uploadResult && (
                    <Alert 
                        severity={uploadResult.success ? "success" : "error"} 
                        sx={{ my: 1 }}
                    >
                        {uploadResult.message}
                    </Alert>
                )}
                
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Input
                        type="file"
                        inputRef={fileInputRef}
                        onChange={handleFileChange}
                        inputProps={{ accept: 'application/pdf' }}
                        style={{ display: 'none' }}
                        id="skill-sheet-upload"
                    />
                    <label htmlFor="skill-sheet-upload">
                        <Button 
                            variant="contained" 
                            component="span"
                            startIcon={<CloudUploadIcon />}
                            disabled={uploading}
                        >
                            {selectedFile ? 'ファイルを選択済み' : 'PDFを選択'}
                        </Button>
                    </label>
                    {selectedFile && <Typography variant="body2">{selectedFile.name}</Typography>}
                </Box>
    
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleUpload}
                    disabled={!selectedFile || uploading}
                    sx={{ mt: 2 }}
                >
                    {uploading ? <CircularProgress size={24} /> : '解析して更新を実行'}
                </Button>
            </Box>

            <Divider sx={{ my: 2 }} />
            
            <Box>
                <Typography variant="h6" gutterBottom>基本情報</Typography>
                <Typography><strong>名前:</strong> {engineer.name}</Typography>
                
                <Box sx={{ mt: 2 }}>
                  {isEditing ? (
                     <FormControl fullWidth>
                        <InputLabel>現在ステータス</InputLabel>
                        <Select
                          value={editData.status}
                          label="現在ステータス"
                          onChange={(e) => handleEditChange('status', e.target.value)}
                        >
                          {['参画中', '営業中', '待機中'].map(option => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                  ) : (
                    <Box component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography component="strong">現在ステータス:</Typography>
                            <Chip label={engineer.status} size="small" sx={{ ml: 1 }} />
                    </Box>
                  )}
                </Box>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>エンジニアメモ (自由記述)</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
               面談の印象、希望条件、補足事項などを自由に記入してください。
            </Typography>
            {isEditing ? (
              <TextField
                label="エンジニアメモ"
                multiline
                rows={6}
                fullWidth
                variant="outlined"
                placeholder="例: コミュニケーション能力が高く、リーダー経験あり。リモート希望。"
                value={editData.memo}
                onChange={(e) => handleEditChange('memo', e.target.value)}
              />
            ) : (
              <Typography style={{ whiteSpace: 'pre-wrap' }}>
                {engineer.memo || 'メモはまだありません。'}
              </Typography>
            )}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SmartToyIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">AI学習ステータス</Typography>
            </Box>
            
            <List>
                <ListItem>
                    <ListItemIcon>
                        {hasSkills ? <CheckCircleIcon color="success" /> : <ErrorOutlineIcon color="action" />}
                    </ListItemIcon>
                    <ListItemText 
                        primary={hasSkills ? "学習データ登録済み" : "学習データ未登録"} 
                        secondary={hasSkills 
                            ? "スキルシートの解析とベクトル化が完了しています。このエンジニアはAIマッチングの検索対象です。" 
                            : "スキルシートが登録されていません。PDFをアップロードしてください。"
                        }
                    />
                </ListItem>
                {hasSkills && (
                  <ListItem>
                    <ListItemText 
                        primary="最終学習日 (データ更新日)"
                        secondary={formatDate(engineer.skills_updated_at)}
                        primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                    />
                  </ListItem>
                )}
            </List>

            {hasSkills && (
                <Box sx={{ mt: 1, ml: 2 }}>
                    <Chip label={`登録データ量: 約${engineer.skills.length}文字`} size="small" variant="outlined" />
                </Box>
            )}
          </Paper>

        </Grid>
      </Grid>
      </Box>
    </Container>
  );
}

export default EngineerDetailPage;