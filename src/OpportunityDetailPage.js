import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from './api';
import {
  Container, Typography, Box, Paper, CircularProgress, Button, Grid, Chip,
  TextField, FormControl, InputLabel, Select, MenuItem,
  Alert, // ★★★ Alertを追加 ★★★
  List, ListItem, ListItemText 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

// ★★★ aiApi.js からのインポートを修正（getSessionを削除し、必要なもののみ）★★★
// ※ getMatchingEngineers は今回はファイル内に一時定義されたものを利用します
const getMatchingEngineers = async (opportunityId) => {
    // 実際にはaiApi.js内で実装される
    const AI_API_URL = 'http://localhost:8001';
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${AI_API_URL}/match/opportunities/${opportunityId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('AIマッチングAPIの呼び出しに失敗しました。');
    const data = await response.json();
    return data.matches;
};

function OpportunityDetailPage() {
  const { opportunityId } = useParams();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ status: '', notes: '' });
  
  // ★★★ AIマッチング結果を保持するState ★★★
  const [matchingEngineers, setMatchingEngineers] = useState(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matchError, setMatchError] = useState(null);

  const opportunityStatusOptions = ['提案中', '面談調整中', '結果待ち', '成約', '失注'];

  const fetchOpportunityDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/opportunities/${opportunityId}`);
      setOpportunity(response.data);
      setEditData({
        status: response.data.status,
        notes: response.data.notes || ''
      });
    } catch (error) {
      console.error("案件詳細の取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  }, [opportunityId]);

  useEffect(() => {
    fetchOpportunityDetails();
  }, [fetchOpportunityDetails]);

  // ★★★ AIマッチング実行ハンドラ ★★★
  const handleMatch = async () => {
    setMatchingEngineers(null); // 前の結果をクリア
    setMatchError(null);
    setIsMatching(true);
    try {
        const matches = await getMatchingEngineers(opportunityId);
        if (matches.length === 0) {
            setMatchError('AI検索の結果、マッチするエンジニアは見つかりませんでした。');
        }
        setMatchingEngineers(matches);
    } catch (error) {
        console.error("AIマッチングエラー:", error);
        setMatchError('マッチングの実行中にエラーが発生しました。');
    } finally {
        setIsMatching(false);
    }
  };


  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await Promise.all([
        api.put(`/opportunities/${opportunityId}/status`, { status: editData.status }),
        api.put(`/opportunities/${opportunityId}/details`, { notes: editData.notes })
      ]);
      alert('案件情報を更新しました。');
      setIsEditing(false);
      fetchOpportunityDetails();
    } catch (error) {
      console.error("案件の更新に失敗しました:", error);
      alert('案件の更新に失敗しました。');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      status: opportunity.status,
      notes: opportunity.notes || ''
    });
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  }

  if (!opportunity) {
    return <Typography>案件が見つかりません。</Typography>;
  }

  const customer = opportunity.customer;
  const engineer = opportunity.engineer;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          案件詳細: {customer ? customer.company_name : '（顧客情報なし）'}
        </Typography>

        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            {engineer && <Button component={Link} to="/engineers" sx={{ mr: 1 }}>&larr; エンジニア状況管理に戻る</Button>}
            {customer && <Button component={Link} to="/customers">&larr; 顧客管理に戻る</Button>}
          </Box>
          
          <Box>
            {/* ★★★ AIマッチングボタンの追加 ★★★ */}
            <Button
              variant="outlined"
              startIcon={<AutoFixHighIcon />}
              onClick={handleMatch}
              disabled={isMatching || isEditing || !opportunity.notes} // メモがないと検索できない
              sx={{ mr: 1 }}
            >
              AIマッチング
            </Button>
            
            {isEditing ? (
              <>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>保存</Button>
                <Button onClick={handleCancel} sx={{ ml: 1 }}>キャンセル</Button>
              </>
            ) : (
              <Button variant="contained" startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>この案件を編集</Button>
            )}
          </Box>
        </Box>

        <Grid container spacing={3}>
        {/* --- 案件サマリー（左カラム） --- */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>案件概要</Typography>
            <Typography><strong>顧客名:</strong> {customer ? (
              <Link to={`/customers/${customer.id}`}>{customer.company_name}</Link>
            ) : 'N/A'}</Typography>
            
            <Typography><strong>担当エンジニア:</strong> {engineer ? engineer.name : 'N/A'}</Typography>
            <Box sx={{ mt: 2 }}>
              {isEditing ? (
                 <FormControl fullWidth>
                    <InputLabel>現在ステータス</InputLabel>
                    <Select
                      value={editData.status}
                      label="現在ステータス"
                      onChange={(e) => handleEditChange('status', e.target.value)}
                    >
                      {opportunityStatusOptions.map(option => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
              ) : (
                <Box component="div" sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography component="strong">現在ステータス:</Typography>
                        <Chip label={opportunity.status} size="small" sx={{ ml: 1 }} />
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* --- 詳細メモ（右カラム） --- */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>詳細メモ・進捗</Typography>
            {isEditing ? (
              <TextField
                label="詳細メモ"
                multiline
                rows={10} 
                fullWidth
                variant="outlined"
                value={editData.notes}
                onChange={(e) => handleEditChange('notes', e.target.value)}
                sx={{ flexGrow: 1 }}
              />
            ) : (
              <Typography style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                {opportunity.notes || 'メモはまだありません。'}
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* --- ★★★ AIマッチング結果エリア (追加) ★★★ */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <AutoFixHighIcon color="primary" sx={{ mr: 1 }} />
          AI推奨マッチング結果
        </Typography>

        {isMatching && (
            <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}><CircularProgress size={20} sx={{ mr: 2 }} />AIが最適なエンジニアを検索中...</Box>
        )}
        
        {matchError && (
            <Alert severity="warning">{matchError}</Alert>
        )}

        {matchingEngineers && matchingEngineers.length > 0 && (
            <Paper sx={{ p: 2 }}>
                <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold' }}>
                    この案件に最もマッチする {matchingEngineers.length} 名のエンジニア:
                </Typography>
                <List dense>
                    {matchingEngineers.map((eng, index) => (
                        <ListItem key={eng.id} divider>
                            <ListItemText
                                primary={
                                  <Link to={`/engineers/${eng.id}`} style={{ fontWeight: 'bold' }}>
                                    {index + 1}. {eng.name} ({eng.status})
                                  </Link>
                                }
                                secondary={`スキル: ${eng.skills}`}
                            />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        )}

        {matchingEngineers && matchingEngineers.length === 0 && !matchError && (
            <Alert severity="info">マッチングするエンジニアは見つかりませんでした。より詳細な案件メモを記入してから再度お試しください。</Alert>
        )}
      </Box>

      </Box>
    </Container>
  );
}

export default OpportunityDetailPage;