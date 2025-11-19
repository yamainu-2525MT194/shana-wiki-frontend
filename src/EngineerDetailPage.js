import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from './api';
import {
  Container, Typography, Box, Paper, CircularProgress, Button, Grid, Chip,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Alert, // ★★★ 追加: アラート表示用 ★★★
  Input, // ★★★ 追加: ファイル入力用 ★★★
  Divider, // ★★★ この行を追加 ★★★
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload'; // ★★★ 追加: アップロードアイコン ★★★


// 案件情報ページではなく、エンジニア情報ページとしてロジック名を修正
function EngineerDetailPage() {
  const { engineerId } = useParams(); // URLからエンジニアIDを取得
  const [engineer, setEngineer] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ status: '', skills: '' });
  
  // ★★★ ファイルアップロード関連のState ★★★
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null); // {success: bool, message: string}
  const fileInputRef = useRef(null);
  
  // 元のコードの関数名を維持（fetchOpportunityDetails => fetchEngineerDetailsとして利用）
  const fetchEngineerDetails = useCallback(async () => {
    setLoading(true);
    try {
      // Endpointを/engineersに変更
      const response = await api.get(`/engineers/${engineerId}`); 
      setEngineer(response.data);
      setEditData({
        status: response.data.status,
        skills: response.data.skills || ''
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
  
  // ★★★ ファイル変更ハンドラ ★★★
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

  // ★★★ アップロード実行ハンドラ (Backend: Port 8000を呼び出す) ★★★
  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadResult(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    const token = localStorage.getItem('accessToken');
    const apiUrl = 'http://localhost:8000'; // Backend API URL

    try {
        const response = await fetch(`${apiUrl}/engineers/${engineerId}/upload-skill-sheet`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}` 
            },
            body: formData 
        });

        if (response.ok) {
            const data = await response.json();
            setUploadResult({ 
                success: true, 
                message: `PDF解析に成功し、AIベクトルを更新しました。新しいステータス: ${data.new_status}` 
            });
            // 情報を再取得して画面を更新
            fetchEngineerDetails(); 
        } else {
            const errorData = await response.json();
            setUploadResult({ 
                success: false, 
                message: `アップロード失敗: ${errorData.detail || response.statusText}` 
            });
        }
    } catch (error) {
        setUploadResult({ success: false, message: 'ネットワーク接続エラーまたはサーバーエラーが発生しました。' });
    } finally {
        setUploading(false);
        setSelectedFile(null);
        // ファイル入力をリセット
        if (fileInputRef.current) {
             fileInputRef.current.value = null;
        }
    }
  };


  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Note: API /engineers/{id}/update-status/{id} と /engineers/{id} に分かれているはず
    try {
      setLoading(true);
      await Promise.all([
        api.put(`/engineers/update-status/${engineerId}`, { status: editData.status }),
        api.put(`/engineers/${engineerId}`, { 
          name: engineer.name, // 名前はそのまま
          skills: editData.skills, // スキルだけ更新
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
      skills: engineer.skills || ''
    });
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  }

  if (!engineer) {
    return <Typography>エンジニアが見つかりません。</Typography>;
  }


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
        {/* --- ファイルアップロード & 基本情報（左カラム） --- */}
        <Grid item xs={12} md={4}>
          {/* ★★★ 2つのセクションをこの単一のPaperに統合します ★★★ */}
          <Paper sx={{ p: 2, height: '100%' }}>
            
            {/* 1. PDFアップロードセクション */}
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>スキルシート自動解析 (PDF)</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    PDFをアップロードすると、スキルとベクトル情報が自動更新されます。
                </Typography>
                
                {/* 結果表示アラート */}
                {uploadResult && (
                    <Alert 
                        severity={uploadResult.success ? "success" : "error"} 
                        sx={{ my: 1 }}
                    >
                        {uploadResult.message}
                    </Alert>
                )}
                
                {/* ファイル選択・ボタン */}
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
            
            {/* 2. 基本情報セクション */}
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

        {/* --- スキル/経歴詳細（右カラム） --- */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>スキル・経歴詳細 (AI学習元)</Typography>
            {isEditing ? (
              <TextField
                label="スキル・経歴詳細"
                multiline
                rows={20} 
                fullWidth
                variant="outlined"
                value={editData.skills}
                onChange={(e) => handleEditChange('skills', e.target.value)}
                sx={{ flexGrow: 1 }}
              />
            ) : (
              <Typography style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {engineer.skills || 'スキル・経歴はまだありません。PDFをアップロードしてください。'}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      </Box>
    </Container>
  );
}

export default EngineerDetailPage;