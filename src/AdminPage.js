import React, { useState } from 'react';
import api from './api';
import { Container, Typography, Box, Paper, TextField, Button } from '@mui/material';
import { Link } from 'react-router-dom';

function AdminPage() {
  // フォーム用のstate
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserDepartmentId, setNewUserDepartmentId] = useState('1');
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [newEngineerName, setNewEngineerName] = useState('');
  const [newEngineerStatus, setNewEngineerStatus] = useState('待機中');
  const [newEngineerSkills, setNewEngineerSkills] = useState('');

  // --- 作成ハンドラ ---
  const handleCreateUser = async (e) => { e.preventDefault(); try { const newUser = { name: newUserName, email: newUserEmail, password: newUserPassword, department_id: parseInt(newUserDepartmentId) }; await api.post('/users/', newUser); alert('新しいユーザーを作成しました！'); setNewUserName(''); setNewUserEmail(''); setNewUserPassword(''); } catch (err) { alert("ユーザーの作成に失敗しました。"); } };
  const handleCreateDepartment = async (e) => { e.preventDefault(); try { await api.post('/departments/', { name: newDepartmentName }); alert('新しい部署を作成しました！'); setNewDepartmentName(''); } catch (err) { alert("部署の作成に失敗しました。"); } };
  const handleCreateEngineer = async (e) => {
     e.preventDefault();
    try { 
      const newEngineer = { 
        name: newEngineerName, 
        status: newEngineerStatus, 
        skills: newEngineerSkills
      }; 
      await api.post('/engineers/', newEngineer); 
      alert('新しいエンジニアを登録しました！'); 
      setNewEngineerName(''); 
      setNewEngineerStatus('待機中');
      setNewEngineerSkills('');
    } catch (err) {
       alert('エンジニアの登録に失敗しました。'); 
      } 
    };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>各種登録ページ</Typography>
        <Button component={Link} to="/dashboard" variant="outlined" sx={{ mb: 2 }}>ダッシュボードに戻る</Button>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' }, gap: 2, mb: 4 }}>
          {/* --- 新規ユーザー登録 --- */}
          <Paper component="form" onSubmit={handleCreateUser} sx={{ p: 2 }}>
            <Typography variant="h6">新規ユーザー登録</Typography>
            <TextField label="名前名" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} fullWidth margin="normal" required />
            <TextField label="Email" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} fullWidth margin="normal" required />
            <TextField label="パスワード" type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} fullWidth margin="normal" required />
            <TextField label="部署ID" type="number" value={newUserDepartmentId} onChange={(e) => setNewUserDepartmentId(e.target.value)} fullWidth margin="normal" required />
            <Button type="submit" variant="contained">ユーザーを作成</Button>
          </Paper>

          {/* --- 新規部署登録 --- */}
          <Paper component="form" onSubmit={handleCreateDepartment} sx={{ p: 2 }}>
            <Typography variant="h6">新規部署登録</Typography>
            <TextField label="部署名" value={newDepartmentName} onChange={(e) => setNewDepartmentName(e.target.value)} fullWidth margin="normal" required />
            <Button type="submit" variant="contained">部署を作成</Button>
          </Paper>
          
          {/* --- 新規エンジニア登録 --- */}
          <Paper component="form" onSubmit={handleCreateEngineer} sx={{ p: 2 }}>
            <Typography variant="h6">新規エンジニア登録</Typography>
            <TextField label="エンジニア名" value={newEngineerName} onChange={(e) => setNewEngineerName(e.target.value)} fullWidth margin="normal" required />
            <TextField 
              label="スキル (カンマ区切り)" 
              value={newEngineerSkills} 
              onChange={(e) => setNewEngineerSkills(e.target.value)} 
              fullWidth 
              margin="normal" 
              helperText="例: Java,React,AWS"
            />
            <TextField label="初期ステータス" value={newEngineerStatus} onChange={(e) => setNewEngineerStatus(e.target.value)} fullWidth margin="normal" required />
            <Button type="submit" variant="contained">エンジニアを登録</Button>
          </Paper>
        </Box>
      </Box>
    </Container>
  );
}

export default AdminPage;