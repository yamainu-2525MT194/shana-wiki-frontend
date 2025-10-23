import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, Typography, Box, TextField, Button, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper 
} from '@mui/material';

function AdminPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserDepartmentId, setNewUserDepartmentId] = useState('1');
  const [newDepartmentName, setNewDepartmentName] = useState('');

  const API_URL = 'https://backend-api-1060579851059.asia-northeast1.run.app'; // ★重要★ あなたのバックエンドURL

  // ★★★ ユーザーと部署の両方を取得する、統一された関数 ★★★
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setError("ログインしていません。");
        return;
      }
      const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

      // Promise.allで、ユーザーと部署の取得を同時に行う
      const [usersResponse, departmentsResponse] = await Promise.all([
        axios.get(`${API_URL}/users/`, authHeaders),
        axios.get(`${API_URL}/departments/`, authHeaders)
      ]);

      setUsers(usersResponse.data);
      setDepartments(departmentsResponse.data);
      setError('');
    } catch (err) {
      console.error("データの取得に失敗しました:", err);
      setError("データの取得に失敗しました。管理者権限がありません。");
    } finally {
      setLoading(false);
    }
  };

  // ページが初めて表示された時に、一度だけデータを取得する
  useEffect(() => {
    fetchData();
  }, []);

  // ... handleDeleteUser, handleUpdateRole は変更なし ...
  const handleDeleteUser = async (userId) => {
    if (window.confirm(`本当にユーザーID: ${userId} を削除しますか？`)) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`${API_URL}/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
        setUsers(users.filter(user => user.id !== userId));
        alert(`ユーザーID: ${userId} を削除しました。`);
      } catch (err) { alert("ユーザーの削除に失敗しました。"); }
    }
  };
  const handleUpdateRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.put(`${API_URL}/users/${userId}/role?role=${newRole}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(users.map(user => user.id === userId ? { ...user, role: newRole } : user));
      alert(`ユーザーID: ${userId} の役割を ${newRole} に変更しました。`);
    } catch (err) { alert("役割の更新に失敗しました。"); }
  };


  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const newUser = {
        name: newUserName, email: newUserEmail, password: newUserPassword, department_id: parseInt(newUserDepartmentId)
      };
      await axios.post(`${API_URL}/users/`, newUser, { headers: { Authorization: `Bearer ${token}` } });
      alert('新しいユーザーを作成しました！');
      setNewUserName(''); setNewUserEmail(''); setNewUserPassword('');
      fetchData(); // ★★★ データを再取得して画面を更新 ★★★
    } catch (err) {
      alert("ユーザーの作成に失敗しました。メールアドレスが重複している可能性があります。");
    }
  };
  
  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`${API_URL}/departments/`, { name: newDepartmentName }, { headers: { Authorization: `Bearer ${token}` } });
      alert('新しい部署を作成しました！');
      setNewDepartmentName('');
      fetchData(); // ★★★ データを再取得して画面を更新 ★★★
    } catch (err) {
      alert("部署の作成に失敗しました。");
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (window.confirm(`本当に部署ID: ${departmentId} を削除しますか？\nこの部署に所属するユーザーがいる場合、エラーになります。`)) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`${API_URL}/departments/${departmentId}`, { headers: { Authorization: `Bearer ${token}` } });
        setDepartments(departments.filter(dep => dep.id !== departmentId));
        alert(`部署ID: ${departmentId} を削除しました。`);
      } catch (err) {
        alert("部署の削除に失敗しました。所属ユーザーがいないか確認してください。");
      }
    }
  };

  if (loading) { return <p>データを読み込み中...</p>; }
  if (error) { return <p style={{ color: 'red' }}>{error}</p>; }

  return (
    // Containerで全体を囲み、中央に配置
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}> {/* myはmargin-top/bottom, sxはスタイル指定 */}
        <Typography variant="h4" component="h1" gutterBottom>
          管理者ダッシュボード
        </Typography>

        {/* --- 2つのフォームを横並びにするためのBox --- */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          {/* --- 新規ユーザー登録フォーム --- */}
          <Paper component="form" onSubmit={handleCreateUser} sx={{ p: 2, flex: 1 }}>
            <Typography variant="h6">新規ユーザー登録</Typography>
            <TextField label="名前" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} fullWidth margin="normal" required />
            <TextField label="Email" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} fullWidth margin="normal" required />
            <TextField label="パスワード" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} fullWidth margin="normal" required />
            <TextField label="部署ID" type="number" value={newUserDepartmentId} onChange={(e) => setNewUserDepartmentId(e.target.value)} fullWidth margin="normal" required />
            <Button type="submit" variant="contained">ユーザーを作成</Button>
          </Paper>

          {/* --- 新規部署登録フォーム --- */}
          <Paper component="form" onSubmit={handleCreateDepartment} sx={{ p: 2, flex: 1 }}>
            <Typography variant="h6">新規部署登録</Typography>
            <TextField label="部署名" value={newDepartmentName} onChange={(e) => setNewDepartmentName(e.target.value)} fullWidth margin="normal" required />
            <Button type="submit" variant="contained">部署を作成</Button>
          </Paper>
        </Box>

        {/* --- 部署一覧テーブル --- */}
        <Typography variant="h6" gutterBottom>既存部署一覧</Typography>
        <TableContainer component={Paper} sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>部署名</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.map((dep) => (
                <TableRow key={dep.id}>
                  <TableCell>{dep.id}</TableCell>
                  <TableCell>{dep.name}</TableCell>
                  <TableCell align="right">
                    <Button variant="outlined" color="secondary" onClick={() => handleDeleteDepartment(dep.id)}>削除</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* --- ユーザー一覧テーブル --- */}
        <Typography variant="h6" gutterBottom>既存ユーザー一覧</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>名前</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>役割</TableCell>
                <TableCell>部署ID</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.department_id}</TableCell>
                  <TableCell align="right">
                    {user.role !== 'admin' && (
                      <Button variant="contained" size="small" onClick={() => handleUpdateRole(user.id, 'admin')}>管理者に昇格</Button>
                    )}
                    <Button variant="outlined" color="secondary" size="small" sx={{ ml: 1 }} onClick={() => handleDeleteUser(user.id)}>削除</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Container>
  );
}

export default AdminPage;