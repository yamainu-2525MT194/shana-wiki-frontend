import React, { useState, useEffect } from 'react';
import api, { deleteCustomer } from './api';
import {
  Container, Typography, Box, Paper, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button,
  Link as MuiLink, TextField, InputAdornment, TableSortLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TablePagination
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link } from 'react-router-dom';

function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [order, setOrder] = useState('desc'); // ★ ソート順のステート
  
  // ★ ページネーション用ステート
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(100);

  // ★ 新規顧客登録ダイアログ用のステート
  const [openDialog, setOpenDialog] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    company_name: '',
    contact_person_name: '',
    email: '',
    phone_number: '',
    url: '',
    memo: ''
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      try {
        const response = await api.get('/customers/');
        setCustomers(response.data);
      } catch (error) {
        console.error("顧客情報の取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleRequestSort = () => {
    const isAsc = order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNewCustomer({
      company_name: '', contact_person_name: '', email: '', phone_number: '', url: '', memo: ''
    });
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.company_name.trim()) {
      alert("会社名は必須です。");
      return;
    }
    try {
      await api.post('/customers/', newCustomer);
      alert('新規顧客を登録しました。');
      handleCloseDialog();
      
      // リスト再取得
      setLoading(true);
      const response = await api.get('/customers/');
      setCustomers(response.data);
      setLoading(false);
    } catch (error) {
      console.error("顧客の登録に失敗しました:", error);
      alert('登録に失敗しました。');
    }
  };

  const handleDeleteCustomer = async (customerId, companyName) => {
    if (!window.confirm(`顧客「${companyName}」を削除しますか？\n※この操作は取り消せません。紐づく案件や接触履歴もすべて削除されます。`)) {
      return;
    }
    try {
      await deleteCustomer(customerId);
      alert('顧客を削除しました。');
      // 一覧を再取得
      const response = await api.get('/customers/');
      setCustomers(response.data);
    } catch (error) {
      console.error("顧客の削除に失敗しました:", error);
      alert('削除に失敗しました。');
    }
  };

  const filteredCustomers = customers.filter(c => 
    (c.company_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.contact_person_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    const dateA = a.last_contact_date ? new Date(a.last_contact_date).getTime() : 0;
    const dateB = b.last_contact_date ? new Date(b.last_contact_date).getTime() : 0;
    
    if (order === 'desc') {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });

  const displayedCustomers = sortedCustomers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              顧客管理
            </Typography>
            {/* 新規登録ボタンをダイアログ表示に変更 */}
            <Button variant="contained" onClick={handleOpenDialog}>
                新規顧客を登録
            </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="会社名や担当者名で検索..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {filteredCustomers.length > 0 ? (
          <>
            <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>会社名</TableCell>
                  <TableCell>担当者名</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>電話番号</TableCell>
                  <TableCell align="center">進行中案件</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={true}
                      direction={order}
                      onClick={handleRequestSort}
                    >
                      最終接触日
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="center">アクション</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedCustomers.map((customer) => (
                  <TableRow key={customer.id} hover>
                    <TableCell component="th" scope="row">
                      {/* ★★★ 会社名を詳細ページへのリンクに変更 ★★★ */}
                      <MuiLink component={Link} to={`/customers/${customer.id}`} underline="hover" sx={{ fontWeight: 'bold' }}>
                        {customer.company_name}
                      </MuiLink>
                    </TableCell>
                    <TableCell>{customer.contact_person_name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone_number}</TableCell>
                    <TableCell align="center">
                      {customer.active_opportunity_count > 0 ? (
                        <Typography color="primary" fontWeight="bold">{customer.active_opportunity_count}</Typography>
                      ) : (
                        <Typography color="text.secondary">0</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {customer.last_contact_date 
                        ? new Date(customer.last_contact_date).toLocaleDateString('ja-JP') 
                        : <Typography color="text.secondary" variant="body2">記録なし</Typography>}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteCustomer(customer.id, customer.company_name)}
                      >
                        削除
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 50, 100]}
            component="div"
            count={sortedCustomers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="表示件数:"
          />
          </>
        ) : (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            {customers.length === 0 ? (
              <Typography>登録されている顧客がいません。「各種登録ページ」から登録してください。</Typography>
            ) : (
              <Typography color="text.secondary">検索条件に一致する顧客が見つかりません。</Typography>
            )}
          </Paper>
        )}
      </Box>

      {/* ★★★ 新規顧客登録ダイアログ ★★★ */}
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>新規顧客登録</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            margin="dense"
            label="会社名 (必須)"
            fullWidth
            variant="outlined"
            value={newCustomer.company_name}
            onChange={(e) => setNewCustomer({ ...newCustomer, company_name: e.target.value })}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="担当者名"
            fullWidth
            variant="outlined"
            value={newCustomer.contact_person_name}
            onChange={(e) => setNewCustomer({ ...newCustomer, contact_person_name: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={newCustomer.email}
            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="電話番号"
            fullWidth
            variant="outlined"
            value={newCustomer.phone_number}
            onChange={(e) => setNewCustomer({ ...newCustomer, phone_number: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="企業URL"
            fullWidth
            variant="outlined"
            placeholder="https://..."
            value={newCustomer.url}
            onChange={(e) => setNewCustomer({ ...newCustomer, url: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="全体メモ"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={newCustomer.memo}
            onChange={(e) => setNewCustomer({ ...newCustomer, memo: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="inherit">キャンセル</Button>
          <Button onClick={handleCreateCustomer} variant="contained" color="primary">登録</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default CustomerListPage;