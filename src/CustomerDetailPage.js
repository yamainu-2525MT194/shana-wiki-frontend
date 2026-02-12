import React, { useState, useEffect, useCallback } from 'react'; 
import { useParams, Link } from 'react-router-dom';
import api from './api';
import {
  Container, Typography, Box, Paper, CircularProgress,
  Button, TextField, Grid,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
  Link as MuiLink 
} from '@mui/material';
// ★★★ 追加: AIマッチング用のアイコンとダイアログ ★★★
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
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
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>顧客情報</Typography>
              <Typography><strong>担当者名:</strong> {customer.contact_person_name || '未登録'}</Typography>
              <Typography><strong>Email:</strong> {customer.email || '未登録'}</Typography>
              <Typography><strong>電話番号:</strong> {customer.phone_number || '未登録'}</Typography>
            </Paper>
          </Grid>

          {/* --- 新しい接触履歴の追加 --- */}
          <Grid item xs={12} md={6}>
            <Paper component="form" onSubmit={handleSaveContact} sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>新しい接触履歴を追加</Typography>
              {/* ★★★ 追加: 日時入力フィールド ★★★ */}
              <TextField
                label="接触日時"
                type="datetime-local"
                fullWidth
                value={newContactDate}
                onChange={(e) => setNewContactDate(e.target.value)}
                sx={{ mb: 2 }}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <TextField
                label="接触内容のメモ"
                multiline
                rows={4}
                fullWidth
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                margin="normal"
              />
              <Button type="submit" variant="contained">保存</Button>
            </Paper>
          </Grid>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            進行中の案件
          </Typography>

          {customer.opportunities && customer.opportunities.length > 0 ? (
            <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>ステータス</TableCell>
                    <TableCell>担当エンジニア</TableCell>
                    <TableCell>メモ</TableCell>
                    {/* ★★★ 追加: AI提案列 ★★★ */}
                    <TableCell align="center">AIマッチング</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {customer.opportunities.map((opp) => (
                    <TableRow key={opp.id}>
                      <TableCell>
                        <Chip 
                          label={opp.status} 
                          size="small" 
                          color={opp.status === '成約' || opp.status === '参画中' ? 'success' : 'default'} 
                        />
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
                      <TableCell sx={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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

          {/* --- 過去の接触履歴 --- */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>接触履歴</Typography>
              {customer.contacts && customer.contacts.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell><strong>日時</strong></TableCell>
                        <TableCell><strong>内容</strong></TableCell>
                        <TableCell><strong>担当者</strong></TableCell>
                        <TableCell align="center"><strong>アクション</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {[...customer.contacts].sort((a, b) => new Date(b.contact_date) - new Date(a.contact_date)).map((contact) => (
                        <TableRow key={contact.id} sx={{ '&:hover': { backgroundColor: '#fafafa' } }}>
                          <TableCell sx={{ width: '180px' }}>
                            {new Date(contact.contact_date).toLocaleString('ja-JP')}
                          </TableCell>

                          {/* ★★★ 修正: ここが重要！whiteSpace: 'pre-wrap' で改行を表示 ★★★ */}
                          <TableCell sx={{ width: '350px', whiteSpace: 'pre-wrap', verticalAlign: 'top' }}>
                            {editingContactId === contact.id ? (
                              <TextField
                                fullWidth
                                multiline
                                rows={4} // 編集時も広く
                                value={editingNotes}
                                onChange={(e) => setEditingNotes(e.target.value)}
                                size="small"
                              />
                            ) : (
                              contact.notes // ここが改行されて表示されます
                            )}
                          </TableCell>

                          <TableCell sx={{ width: '150px' }}>
                            {contact.user?.name || '未登録'}
                          </TableCell>
                          <TableCell align="center" sx={{ width: '150px' }}>
                            {editingContactId === contact.id ? (
                              <>
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="success"
                                  onClick={() => handleUpdateContact(contact.id)}
                                  sx={{ mr: 1 }}
                                >
                                  保存
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  onClick={handleCancelEdit}
                                >
                                  キャンセル
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="primary"
                                  onClick={() => handleEditContact(contact)}
                                  sx={{ mr: 1 }}
                                >
                                  編集
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  color="error"
                                  onClick={() => handleDeleteContact(contact.id)}
                                >
                                  削除
                                </Button>
                              </>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography>接触履歴はまだありません。</Typography>
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