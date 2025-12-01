import React, { useState, useEffect } from 'react';
import api from './api';
import {
  Container, Typography, Box, Paper, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button,
  Link as MuiLink // ★★★ リンクコンポーネントをインポート ★★★
} from '@mui/material';
import { Link } from 'react-router-dom';

function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

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

        {customers.length > 0 ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>会社名</TableCell>
                  <TableCell>担当者名</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>電話番号</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id} hover>
                    <TableCell component="th" scope="row">
                      {/* ★★★ 会社名を詳細ページへのリンクに変更 ★★★ */}
                      <MuiLink component={Link} to={`/customers/${customer.id}`} underline="hover">
                        {customer.company_name}
                      </MuiLink>
                    </TableCell>
                    <TableCell>{customer.contact_person_name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.phone_number}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography>登録されている顧客がいません。「各種登録ページ」から登録してください。</Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default CustomerListPage;