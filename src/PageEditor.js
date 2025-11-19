// useRef を削除
import React, { useState, useEffect } from 'react';

// useNavigate を削除
import { useParams } from 'react-router-dom';
import api from './api';
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert, // ★UI FIX: Alertを追加
  FormControlLabel,
  Checkbox,
  Tooltip,
  Divider, // ★UI FIX: Dividerを追加
  Grid // ★UI FIX: Gridを追加
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'; // ★AI FEATURE: AIアイコンを追加
import AddIcon from '@mui/icons-material/Add';
// import EditIcon from '@mui/icons-material/Edit';


// 必要なAPI関数（Backendの部署APIを直接利用）
const getDepartments = async () => {
    return api.get('/departments/'); 
};


function PageEditor({ onSaveSuccess, onCancel }) {
  // ★★★ 1. ID/モードの判定ロジック ★★★
  const { pageId } = useParams(); // URLからIDを取得 ('123' または 'new')
  
  // 編集/新規作成のためのState
  const [page, setPage] = useState({ title: '', content: '', allowed_department_ids: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [departments, setDepartments] = useState([]);
  
  // ★★★ AI学習のステータス管理用State ★★★
  const [vectorStatus, setVectorStatus] = useState(null); 
  
  // ページモードの判定: 'new' または IDがない場合は新規作成
  const isNewPage = pageId === 'new' || !pageId; 
  const isEditMode = !isNewPage; 


  // データの取得と初期化 (ユーザー、部署、既存ページ)
  const fetchPageAndDependencies = useCallback(async () => {
    setLoading(true);
    try {
      // 部署一覧を取得
      const deptResponse = await getDepartments(); 
      setDepartments(deptResponse.data);

      // ★★★ CRITICAL FIX: 既存ページ編集の場合のみデータをフェッチする ★★★
      if (isEditMode) { 
        // 既存ページの場合のみデータをフェッチ (pageIdは'new'ではない)
        const response = await api.get(`/pages/${pageId}`);
        const pageData = response.data;
        
        setPage({
          title: pageData.title,
          content: pageData.content,
          allowed_department_ids: pageData.allowed_departments.map(d => d.id)
        });
      } else {
        // 新規作成の場合、pageIdが 'new' でも'undefined'でもエラーを回避
        setPage(prev => ({ ...prev, title: '', content: '' }));
      }
    } catch (err) {
      console.error('データの読み込みに失敗しました:', err);
      // ★エラーオブジェクトをそのまま渡さないように保護★
      setError(err.response?.data?.detail || 'データの読み込みに失敗しました。'); 
    } finally {
      setLoading(false);
    }
  }, [pageId, isEditMode]); // isEditModeを追加して依存関係を明確化

  useEffect(() => {
    fetchPageAndDependencies();
  }, [fetchPageAndDependencies]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setPage(prev => ({ ...prev, [name]: value }));
  };

  const handleDepartmentChange = (departmentId) => {
    setPage(prev => {
      const currentIds = prev.allowed_department_ids;
      const newIds = currentIds.includes(departmentId)
        ? currentIds.filter(id => id !== departmentId)
        : [...currentIds, departmentId];
      return { ...prev, allowed_department_ids: newIds };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setVectorStatus(null); // 保存時に学習ステータスをリセット
    try {
      const data = {
        title: page.title,
        content: page.content,
        allowed_department_ids: page.allowed_department_ids
      };

      let response;
      if (isNewPage) {
        response = await api.post('/pages/', data);
      } else {
        response = await api.put(`/pages/${pageId}`, data);
      }
      
      onSaveSuccess(response.data.id || pageId);

    } catch (err) {
      console.error('保存エラー:', err);
      setError(err.response?.data?.detail || 'ページの保存中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  // ★★★ AI学習トリガーの実行 ★★★
  const handleVectorize = async (id) => {
    setVectorStatus(null);
    setLoading(true);
    try {
        // Backend API (Port 8000) を呼び出し、AI Chatサーバー (Port 8001) への転送を依頼
        const response = await api.post(`/pages/${id}/vectorize`); 
        setVectorStatus({ 
            success: true, 
            message: 'AI学習を依頼しました。数秒後にチャットで検索可能になります。' 
        });
        console.log('Vectorization Triggered:', response.data);
    } catch (error) {
        console.error('AI学習トリガー失敗:', error.response?.data?.detail || error);
        setVectorStatus({ 
            success: false, 
            message: `学習のトリガーに失敗しました: ${error.response?.data?.detail || 'サーバーに接続できません'}` 
        });
    } finally {
        setLoading(false);
    }
  };


  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isNewPage ? <><AddIcon sx={{ mr: 1, verticalAlign: 'middle' }} />新規Wikiページ作成</> : `ページ編集: ${page.title}`}
      </Typography>

      {/* ★エラー保護されたレンダリング★ */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{typeof error === 'object' ? JSON.stringify(error) : error}</Alert>}
      
      {/* AI学習ステータス表示エリア */}
      {vectorStatus && (
        <Alert severity={vectorStatus.success ? "success" : "error"} sx={{ mb: 2 }}>
            {vectorStatus.message}
        </Alert>
      )}

      {/* タイトルとコンテンツ */}
      <TextField
        fullWidth
        label="タイトル"
        name="title"
        value={page.title}
        onChange={handleChange}
        margin="normal"
        variant="outlined"
      />
      <TextField
        fullWidth
        label="コンテンツ (Markdown可)"
        name="content"
        value={page.content}
        onChange={handleChange}
        margin="normal"
        multiline
        rows={15}
        variant="outlined"
      />

      <Divider sx={{ my: 3 }} />

      {/* 権限設定とボタン */}
      <Grid container spacing={3}>
        {/* 権限設定 */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" sx={{ mb: 1 }}>閲覧権限設定</Typography>
          {departments.map(dept => (
            <FormControlLabel
              key={dept.id}
              control={
                <Checkbox
                  checked={page.allowed_department_ids.includes(dept.id)}
                  onChange={() => handleDepartmentChange(dept.id)}
                />
              }
              label={dept.name}
            />
          ))}
        </Grid>
        
        {/* ボタン群 */}
        <Grid item xs={12} md={6}>
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
            
            {/* AI学習ボタン (新規作成時は非表示) */}
            {isEditMode && ( // ★★★ 編集モードでのみ表示 ★★★
                <Tooltip title="現在のページ内容をAIに強制学習させ、検索結果に即時反映します。">
                    <Button
                        variant="outlined"
                        startIcon={<AutoFixHighIcon />}
                        onClick={() => handleVectorize(pageId)}
                        disabled={loading}
                        color="secondary"
                    >
                        AI学習を更新
                    </Button>
                </Tooltip>
            )}
            
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSave}
              disabled={loading}
              sx={{ minWidth: 100 }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : '保存'}
            </Button>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
            >
              キャンセル
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PageEditor;