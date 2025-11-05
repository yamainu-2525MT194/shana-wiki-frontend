import React, { useState, useEffect, useCallback } from 'react'; // ★★★ useCallbackを追加 ★★★
import { useParams, Link } from 'react-router-dom';
import api from './api';
import {
  Container, Typography, Box, Paper, CircularProgress, Button,
  TextField, List, ListItem, ListItemText, Divider, Grid
} from '@mui/material';

function CustomerDetailPage() {
  const { customerId } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');

  // ★★★【修正点1】★★★
  // fetchCustomerDetailsをuseCallbackで囲む
  // これにより、customerIdが変わらない限り、この関数は「同じもの」として扱われる
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
  }, [customerId]); // この関数は customerId にのみ依存する

  // ★★★【修正点2】★★★
  // useEffectは、customerIdではなく、fetchCustomerDetails関数に依存する
  // これで、Reactの警告(exhaustive-deps)が解消される
  useEffect(() => {
    fetchCustomerDetails();
  }, [fetchCustomerDetails]); 

  // 接触履歴を保存するハンドラ
  const handleSaveContact = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) {
      alert('メモを入力してください。');
      return;
    }
    try {
      await api.post(`/customers/${customerId}/contacts/`, {
        notes: newNote
      });
      alert('接触履歴を保存しました。');
      setNewNote(''); // フォームをクリア
      fetchCustomerDetails(); // ★ 変更なし：useCallbackで定義された関数を呼ぶ
    } catch (error) {
      console.error("接触履歴の保存に失敗しました:", error);
      alert('保存に失敗しました。');
    }
  }; // ★★★【修正点3】: 余分な括弧を削除 ★★★

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

          {/* --- 過去の接触履歴 --- */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, mt: 2 }}>
              <Typography variant="h6" gutterBottom>接触履歴</Typography>
              {customer.contacts && customer.contacts.length > 0 ? (
                <List>
                  {/* ★★★ 接触履歴を新しい順にソートして表示 ★★★ */}
                  {[...customer.contacts].sort((a, b) => new Date(b.contact_date) - new Date(a.contact_date)).map((contact, index) => (
                    <React.Fragment key={contact.id}>
                      <ListItem>
                        <ListItemText
                          primary={contact.notes}
                          secondary={`日時: ${new Date(contact.contact_date).toLocaleString('ja-JP')}`}
                        />
                      </ListItem>
                      {index < customer.contacts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography>接触履歴はまだありません。</Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default CustomerDetailPage;