import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from './api';
import {
  Container, Typography, Box, Paper, CircularProgress, Button, Grid, Chip,
  TextField, FormControl, InputLabel, Select, MenuItem // ★★★ 編集用コンポーネントをインポート ★★★
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit'; // ★★★ 編集アイコンをインポート ★★★
import SaveIcon from '@mui/icons-material/Save'; // ★★★ 保存アイコンをインポート ★★★

function OpportunityDetailPage() {
  const { opportunityId } = useParams(); // URLから案件IDを取得
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);

  // ★★★ 編集モードを管理するState ★★★
  const [isEditing, setIsEditing] = useState(false);
  // ★★★ 編集中のデータを保持するState ★★★
  const [editData, setEditData] = useState({ status: '', notes: '' });

  // 選択可能なステータス
  const opportunityStatusOptions = ['提案中', '面談調整中', '結果待ち', '成約', '失注'];

  const fetchOpportunityDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/opportunities/${opportunityId}`);
      setOpportunity(response.data);
      // ★★★ 編集用stateも初期化 ★★★
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

  // ★★★ 編集フォームの入力値を更新するハンドラ ★★★
  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  // ★★★ 保存ボタンを押したときの処理 ★★★
  const handleSave = async () => {
    try {
      setLoading(true);
      // 2つのAPI（ステータス更新と詳細更新）を同時に呼び出す
      await Promise.all([
        api.put(`/opportunities/${opportunityId}/status`, { status: editData.status }),
        api.put(`/opportunities/${opportunityId}/details`, { notes: editData.notes })
      ]);
      alert('案件情報を更新しました。');
      setIsEditing(false); // 編集モードを終了
      fetchOpportunityDetails(); // 最新のデータを再取得
    } catch (error) {
      console.error("案件の更新に失敗しました:", error);
      alert('案件の更新に失敗しました。');
      setLoading(false);
    }
  };

  // ★★★ キャンセルボタンを押したときの処理 ★★★
  const handleCancel = () => {
    setIsEditing(false);
    // 編集内容を破棄して、元のデータに戻す
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

  // 関連データへのショートカット
  const customer = opportunity.customer;
  const engineer = opportunity.engineer;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          案件詳細: {customer ? customer.company_name : '（顧客情報なし）'}
        </Typography>
        {/* --- 戻るボタンと編集ボタン --- */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            {engineer && <Button component={Link} to="/engineers" sx={{ mr: 1 }}>&larr; エンジニア状況管理に戻る</Button>}
            {customer && <Button component={Link} to="/customers">&larr; 顧客管理に戻る</Button>}
          </Box>
          <Box>
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
          {/* --- 案件サマリー --- */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>案件概要</Typography>
              <Typography><strong>顧客名:</strong> {customer ? (
                <Link to={`/customers/${customer.id}`}>{customer.company_name}</Link>
              ) : 'N/A'}</Typography>
              
              <Typography><strong>担当エンジニア:</strong> {engineer ? engineer.name : 'N/A'}</Typography>
              <Box sx={{ mt: 2 }}>
                {isEditing ? (
                  // --- 編集モード：ステータス ---
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
                  // --- 通常表示：ステータス ---
                  <Typography><strong>現在ステータス:</strong> <Chip label={opportunity.status} size="small" sx={{ ml: 1 }} /></Typography>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* --- 詳細メモ --- */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="h6" gutterBottom>詳細メモ・進捗</Typography>
              {isEditing ? (
                // --- 編集モード：メモ ---
                <TextField
                  label="詳細メモ"
                  multiline
                  rows={5}
                  fullWidth
                  variant="outlined"
                  value={editData.notes}
                  onChange={(e) => handleEditChange('notes', e.target.value)}
                />
              ) : (
                // --- 通常表示：メモ ---
                <Typography style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                  {opportunity.notes || 'メモはまだありません。'}
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>

      </Box>
    </Container>
  );
}

export default OpportunityDetailPage;