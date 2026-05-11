import React, { useState, useEffect } from 'react';
import api from './api';
import {
  Container, Typography, Box, Paper, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button,
  Link as MuiLink, TextField, InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { Link } from 'react-router-dom';

function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredCustomers = customers.filter(c => 
    (c.company_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.contact_person_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            {/* 新規登録ボタンのリンク先を /admin から /customers/new に変更（将来的な拡張のため） */}
            <Button component={Link} to="/admin" variant="contained">
                新規顧客を登録
            </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="会社名や担当者名で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>会社名</TableCell>
                  <TableCell>担当者名</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>電話番号</TableCell>
                  <TableCell align="center">進行中案件</TableCell>
                  <TableCell>最終接触日</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCustomers.map((customer) => (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
    </Container>
  );
}

export default CustomerListPage;