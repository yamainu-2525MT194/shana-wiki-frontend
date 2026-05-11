import React, { useState, useEffect, useCallback } from 'react'; 
import { useParams, Link } from 'react-router-dom';
import api from './api';
import {
  Container, Typography, Box, Paper, CircularProgress,
  Button, TextField, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
  Link as MuiLink 
} from '@mui/material';
// ★★★ 追加: アイコン ★★★
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EngineerMatchingDialog from './EngineerMatchingDialog'; 

function CustomerDetailPage() {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');

  const [newContactDate, setNewContactDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  // ★★★ 追加: マッチングダイアログ用のステート ★★★
  const [openMatchDialog, setOpenMatchDialog] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  // ★★★ 追加: 接触履歴の編集機能 ★★★
  const [editingContactId, setEditingContactId] = useState(null);
  const [editingNotes, setEditingNotes] = useState('');

  const fetchCustomerDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/customers/${customerId}`);
      setCustomer(response.data);
    } catch (error) {
      console.error("顧客詳細の取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  }, [customerId]); 

  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]); 

  // ★★★ 追加: AIマッチングボタンを押した時の処理 ★★★
  const handleOpenMatch = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setOpenMatchDialog(true);
  };

  const handleCloseMatch = () => {
    setOpenMatchDialog(false);
    setSelectedOpportunity(null);
  };

  const handleSaveContact = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) {
      alert('メモを入力してください。');
      return;
    }
    try {
      const response = await api.post(`/customers/${customerId}/contacts/`, {
        notes: newNote,
        contact_date: new Date(newContactDate).toISOString() // ISO形式に変換
      });
      console.log("✅ Contact created:", response.data); // ★デバッグ出力
      alert('接触履歴を保存しました。');
      setNewNote('');

      // 日付を現在時刻にリセット
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setNewContactDate(now.toISOString().slice(0, 16));

      // ★重要: 保存後にデータを再取得して画面を更新
      await fetchCustomerDetails();
    } catch (error) {
      console.error("接触履歴の保存に失敗しました:", error);
      alert('保存に失敗しました。');
    }
  };

  // ★★★ 追加: 編集開始 ★★★
  const handleEditContact = (contact) => {
    setEditingContactId(contact.id);
    setEditingNotes(contact.notes);
  };

  // ★★★ 追加: 編集キャンセル ★★★
  const handleCancelEdit = () => {
    setEditingContactId(null);
    setEditingNotes('');
  };

  // ★★★ 追加: 編集保存 ★★★
  const handleUpdateContact = async (contactId) => {
    if (!editingNotes.trim()) {
      alert('メモを入力してください。');
      return;
    }
    try {
      await api.put(`/contacts/${contactId}`, {
        notes: editingNotes
      });
      alert('接触履歴を更新しました。');
      setEditingContactId(null);
      setEditingNotes('');
      fetchCustomerDetails();
    } catch (error) {
      console.error("接触履歴の更新に失敗しました:", error);
      alert('更新に失敗しました。');
    }
  };

  // ★★★ 追加: 削除 ★★★
  const handleDeleteContact = async (contactId) => {
    if (!window.confirm('この接触履歴を削除しますか？')) {
      return;
    }
    try {
      await api.delete(`/contacts/${contactId}`);
      alert('接触履歴を削除しました。');
      fetchCustomerDetails();
    } catch (error) {
      console.error("接触履歴の削除に失敗しました:", error);
      alert('削除に失敗しました。');
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  }

  if (!customer) {
    return <Typography>顧客が見つかりません。</Typography>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Button component={Link} to="/customers" sx={{ mb: 2 }}>
          &larr; 顧客一覧に戻る
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          {customer.company_name} - 詳細
        </Typography>

        <Grid container spacing={3}>
          {/* --- 顧客詳細 --- */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }} elevation={2}>
              <Typography variant="h6" gutterBottom color="primary" sx={{ borderBottom: '1px solid #eee', pb: 1, mb: 2 }}>
                顧客情報
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">担当者名</Typography>
                <Typography variant="body1">{customer.contact_person_name || '未登録'}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">Email</Typography>
                <Typography variant="body1">{customer.email || '未登録'}</Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary">電話番号</Typography>
                <Typography variant="body1">{customer.phone_number || '未登録'}</Typography>
              </Box>
              {/* 今後URLや顧客メモなどを追加する場合はここに配置 */}
            </Paper>
          </Grid>

          {/* --- 新しい接触履歴の追加 --- */}
          <Grid item xs={12} md={8}>
            <Paper component="form" onSubmit={handleSaveContact} sx={{ p: 3, height: '100%', bgcolor: '#f8fbff' }} elevation={1}>
              <Typography variant="h6" gutterBottom color="primary.dark">
                <AddIcon sx={{ verticalAlign: 'middle', mr: 1, mb: 0.5 }} />
                新しい接触履歴を追加
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="接触日時"
                    type="datetime-local"
                    fullWidth
                    value={newContactDate}
                    onChange={(e) => setNewContactDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    label="接触内容のメモ"
                    multiline
                    rows={3}
                    fullWidth
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    size="small"
                    placeholder="今日話した内容や次回のネクストアクションなどを記載してください"
                  />
                </Grid>
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button type="submit" variant="contained" color="primary" disableElevation>
                  履歴を記録する
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* --- 進行中の案件 --- */}
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
            進行中の案件
          </Typography>

          {customer.opportunities && customer.opportunities.length > 0 ? (
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: '#f5f5f5' }}>
                  <TableRow>
                    <TableCell>ステータス</TableCell>
                    <TableCell>案件概要</TableCell>
                    <TableCell>担当エンジニア</TableCell>
                    <TableCell>メモ</TableCell>
                    {/* ★★★ 追加: AI提案列 ★★★ */}
                    <TableCell align="center">アクション</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customer.opportunities.map((opp) => (
                    <TableRow key={opp.id} hover>
                      <TableCell>
                        <Chip 
                          label={opp.status} 
                          size="small" 
                          color={opp.status === '成約' || opp.status === '参画中' ? 'success' : 'default'} 
                        />
                      </TableCell>
                      <TableCell>
                        <MuiLink component={Link} to={`/opportunities/${opp.id}`} underline="hover" sx={{ fontWeight: 'bold' }}>
                          {opp.description ? (opp.description.length > 30 ? opp.description.substring(0,30) + '...' : opp.description) : '(概要なし) 詳細を見る'}
                        </MuiLink>
                      </TableCell>
                      <TableCell>
                        {opp.engineer ? (
                          <MuiLink component={Link} to={`/engineers/${opp.engineer.id}`} underline="hover">
                            {opp.engineer.name}
                          </MuiLink>
                        ) : (
                          <Typography variant="body2" color="text.secondary">未定</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {opp.notes || '-'}
                      </TableCell>
                      {/* ★★★ 追加: ボタン配置 ★★★ */}
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          startIcon={<AutoAwesomeIcon />}
                          onClick={() => handleOpenMatch(opp)}
                          disabled={!opp.notes} // メモがないとマッチングできないため
                        >
                          候補を探す
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              現在進行中の案件はありません。
            </Typography>
          )}

          </Grid>

          {/* --- 過去の接触履歴 (タイムラインUI) --- */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3, mt: 2 }} elevation={2}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                接触履歴タイムライン
              </Typography>
              
              {customer.contacts && customer.contacts.length > 0 ? (
                <Box sx={{ position: 'relative', ml: { xs: 1, md: 3 }, mt: 3, borderLeft: '3px solid #e0e0e0', pl: 3 }}>
                  {[...customer.contacts].sort((a, b) => new Date(b.contact_date) - new Date(a.contact_date)).map((contact, index) => (
                    <Box key={contact.id} sx={{ mb: 4, position: 'relative' }}>
                      {/* Timeline dot */}
                      <Box sx={{
                        position: 'absolute',
                        left: -33,
                        top: 8,
                        width: 16,
                        height: 16,
                        bgcolor: index === 0 ? 'primary.main' : 'grey.400',
                        borderRadius: '50%',
                        border: '3px solid white',
                        boxShadow: '0 0 0 1px #e0e0e0'
                      }} />
                      
                      <Paper elevation={1} sx={{ p: 2, bgcolor: index === 0 ? '#fafcff' : '#fff', border: '1px solid #f0f0f0' }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1} flexWrap="wrap">
                          <Typography variant="subtitle2" color={index === 0 ? "primary" : "text.secondary"} sx={{ fontWeight: 'bold' }}>
                            {new Date(contact.contact_date).toLocaleString('ja-JP')}
                            <Box component="span" sx={{ ml: 2, fontWeight: 'normal', color: 'text.secondary' }}>
                              担当: {contact.user?.name || '未登録'}
                            </Box>
                          </Typography>
                          
                          <Box>
                            {editingContactId === contact.id ? (
                               <>
                                <Button size="small" variant="contained" color="success" onClick={() => handleUpdateContact(contact.id)} sx={{ mr: 1 }}>
                                  保存
                                </Button>
                                <Button size="small" variant="outlined" onClick={handleCancelEdit}>
                                  キャンセル
                                </Button>
                               </>
                            ) : (
                               <>
                                <Button size="small" onClick={() => handleEditContact(contact)} sx={{ minWidth: 'auto', p: 0.5, mr: 1 }}>
                                  編集
                                </Button>
                                <Button size="small" color="error" onClick={() => handleDeleteContact(contact.id)} sx={{ minWidth: 'auto', p: 0.5 }}>
                                  削除
                                </Button>
                               </>
                            )}
                          </Box>
                        </Box>
                        
                        {editingContactId === contact.id ? (
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            value={editingNotes}
                            onChange={(e) => setEditingNotes(e.target.value)}
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        ) : (
                          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mt: 1, color: '#333' }}>
                            {contact.notes}
                          </Typography>
                        )}
                      </Paper>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="text.secondary" sx={{ mt: 2, ml: 1 }}>接触履歴はまだありません。</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* ★★★ 追加: マッチングダイアログの表示 ★★★ */}
      <EngineerMatchingDialog
        open={openMatchDialog}
        onClose={handleCloseMatch}
        opportunity={selectedOpportunity}
      />
    </Container>
  );
}

export default CustomerDetailPage;