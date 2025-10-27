import React, { useState } from 'react';
import api from './api';
import { useNavigate } from 'react-router-dom';
import { Paper, Box, Typography, TextField, Button, Alert } from '@mui/material';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      const response = await api.post('https://backend-api-1060579851059.asia-northeast1.run.app/login', params);
      
      localStorage.setItem('accessToken', response.data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError("メールアドレスまたはパスワードが違います。");
    }
  };

  return (
    // --- ↓↓↓ これが中央揃えを実現する魔法のBoxです ↓↓↓ ---
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh', // 画面全体の高さを使う
        backgroundColor: '#282c34', // App.cssから背景色を移動
      }}
    >
      <Paper component="form" onSubmit={handleLogin} sx={{ padding: 4, width: '100%', maxWidth: '400px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
            社内Wiki ログイン
          </Typography>
          
          {error && <Alert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</Alert>}
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="メールアドレス"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="パスワード"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            ログイン
          </Button>
        </Box>
      </Paper>
    </Box>
    // --- ↑↑↑ ここまで ---
  );
}

export default LoginPage;