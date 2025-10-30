import React, { useState, useEffect } from 'react';
import api from './api';
import {
  Container, Typography, Box, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, CircularProgress, Button
} from '@mui/material';

function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersResponse, departmentsResponse] = await Promise.all([
        api.get('/users/'),
        api.get('/departments/')
      ]);
      setUsers(usersResponse.data);
      setDepartments(departmentsResponse.data);
      setError('');
    } catch (err) {
      console.error("データの取得に失敗しました:", err);
      setError("データの取得に失敗しました。管理者権限を確認してください。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 削除・更新ハンドラ ---
  const handleDeleteUser = async (userId) => { if (window.confirm(`本当にユーザーID: ${userId} を削除しますか？`)) { try { await api.delete(`/users/${userId}`); setUsers(users.filter(user => user.id !== userId)); alert(`ユーザーID: ${userId} を削除しました。`); } catch (err) { alert("ユーザーの削除に失敗しました。"); } } };
  const handleUpdateRole = async (userId, newRole) => { try { await api.put(`/users/${userId}/role?role=${newRole}`); setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user)); alert(`ユーザーID: ${userId} の役割を ${newRole} に変更しました。`); } catch (err) { alert("役割の更新に失敗しました。"); } };
  const handleDeleteDepartment = async (departmentId) => { if (window.confirm(`本当に部署ID: ${departmentId} を削除しますか？`)) { try { await api.delete(`/departments/${departmentId}`); setDepartments(departments.filter(dep => dep.id !== departmentId)); alert(`部署ID: ${departmentId} を削除しました。`); } catch (err) { alert("部署の削除に失敗しました。"); } } };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>ユーザー・部署 管理</Typography>

        <Typography variant="h6" gutterBottom>既存部署一覧</Typography>
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table><TableHead><TableRow><TableCell>ID</TableCell><TableCell>部署名</TableCell><TableCell align="right">操作</TableCell></TableRow></TableHead>
            <TableBody>
              {departments.map((dep) => (<TableRow key={dep.id}><TableCell>{dep.id}</TableCell><TableCell>{dep.name}</TableCell><TableCell align="right"><Button variant="outlined" color="secondary" onClick={() => handleDeleteDepartment(dep.id)}>削除</Button></TableCell></TableRow>))}
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" gutterBottom>既存ユーザー一覧</Typography>
        <TableContainer component={Paper}>
          <Table><TableHead><TableRow><TableCell>ID</TableCell><TableCell>名前</TableCell><TableCell>Email</TableCell><TableCell>役割</TableCell><TableCell>部署ID</TableCell><TableCell align="right">操作</TableCell></TableRow></TableHead>
            <TableBody>
              {users.map((user) => (<TableRow key={user.id}><TableCell>{user.id}</TableCell><TableCell>{user.name}</TableCell><TableCell>{user.email}</TableCell><TableCell>{user.role}</TableCell><TableCell>{user.department_id}</TableCell><TableCell align="right">{user.role !== 'admin' && (<Button variant="contained" size="small" onClick={() => handleUpdateRole(user.id, 'admin')}>管理者に昇格</Button>)}<Button variant="outlined" color="secondary" size="small" sx={{ ml: 1 }} onClick={() => handleDeleteUser(user.id)}>削除</Button></TableCell></TableRow>))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}

export default UserManagementPage;