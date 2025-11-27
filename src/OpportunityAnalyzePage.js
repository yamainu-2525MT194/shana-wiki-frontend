// shana-wiki-frontend/src/OpportunityAnalyzePage.js

import React, { useState, useEffect } from 'react';
import { 
  Box, Button, TextField, Typography, Paper, Grid, Chip, Stack, 
  CircularProgress, Alert, Divider, Container,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import SaveIcon from '@mui/icons-material/Save';
import { analyzeOpportunity } from './aiApi';
import { createOpportunity, getCustomers } from './api'; // api.jsからインポート
import { useNavigate } from 'react-router-dom';

const OpportunityAnalyzePage = () => {
  const navigate = useNavigate();
  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // 登録ダイアログ用
  const [openDialog, setOpenDialog] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [registering, setRegistering] = useState(false);

  // 初回ロード時に顧客一覧を取得しておく
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const data = await getCustomers();
        setCustomers(data);
      } catch (err) {
        console.error("顧客一覧の取得に失敗:", err);
      }
    };
    fetchCustomers();
  }, []);

  const handleAnalyze = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await analyzeOpportunity(rawText);
      setResult(data);
    } catch (err) {
      setError('AI分析中にエラーが発生しました: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRegister = () => {
    setOpenDialog(true);
  };

  const handleRegister = async () => {
    if (!selectedCustomerId) {
      alert("顧客を選択してください");
      return;
    }
    setRegistering(true);
    try {
      // AIの結果を整形して notes に保存
      const notesContent = `
【概要】
${result.summary}

【必須スキル】
${result.required_skills.join(', ')}

【尚可スキル】
${result.preferred_skills.join(', ')}

【条件】
${result.conditions}

【AIアドバイス】
${result.sales_advice}
      `.trim();

      await createOpportunity({
        customer_id: selectedCustomerId,
        status: "募集中",
        notes: notesContent
      });

      alert("案件を登録しました！");
      navigate('/dashboard'); // 登録後はダッシュボードへ戻る（または案件一覧へ）

    } catch (err) {
      alert("登録に失敗しました: " + err.message);
    } finally {
      setRegistering(false);
      setOpenDialog(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="div" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <AutoFixHighIcon color="primary" fontSize="large" />
        案件情報のAI自動解析
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        メールやチャットの案件情報を貼り付けるだけで、AIが要点を抽出・構造化します。
      </Typography>

      <Grid container spacing={3}>
        {/* 左側: 入力エリア */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>1. テキスト入力</Typography>
            <TextField
              label="案件メール/テキストをここに貼り付け"
              multiline
              rows={15}
              fullWidth
              variant="outlined"
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="例: 【急募】Javaエンジニア募集..."
              sx={{ mb: 2 }}
            />
            <Button 
              variant="contained" 
              size="large" 
              fullWidth 
              onClick={handleAnalyze}
              disabled={loading || !rawText}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
            >
              {loading ? 'AIが分析中...' : 'AIで構造化する'}
            </Button>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          </Paper>
        </Grid>

        {/* 右側: 結果表示エリア */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%', bgcolor: result ? '#f5f9ff' : '#f5f5f5' }}>
            <Typography variant="h6" gutterBottom>2. 分析結果</Typography>
            
            {!result && !loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: 'text.secondary' }}>
                左側にテキストを入力して分析ボタンを押してください
              </Box>
            )}

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                <CircularProgress />
              </Box>
            )}

            {result && (
              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" color="primary">サマリー</Typography>
                  <Typography variant="body1" fontWeight="bold">{result.summary}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" color="primary" gutterBottom>スキル要件</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                    <Typography variant="caption" sx={{ width: '100%' }}>必須:</Typography>
                    {result.required_skills.length > 0 ? (
                      result.required_skills.map((skill, index) => (
                        <Chip key={index} label={skill} color="error" variant="outlined" size="small" />
                      ))
                    ) : <Typography variant="body2">なし</Typography>}
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Typography variant="caption" sx={{ width: '100%' }}>尚可:</Typography>
                    {result.preferred_skills.length > 0 ? (
                      result.preferred_skills.map((skill, index) => (
                        <Chip key={index} label={skill} color="success" variant="outlined" size="small" />
                      ))
                    ) : <Typography variant="body2">なし</Typography>}
                  </Stack>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="subtitle2" color="primary">条件面</Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{result.conditions}</Typography>
                </Box>
                <Box sx={{ bgcolor: '#fff3e0', p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" color="warning.dark">🤖 AI営業アドバイス</Typography>
                  <Typography variant="body2">{result.sales_advice}</Typography>
                </Box>

                <Button 
                  variant="contained" 
                  color="success" 
                  size="large" 
                  startIcon={<SaveIcon />}
                  onClick={handleOpenRegister}
                  sx={{ mt: 2 }}
                >
                  この内容で案件登録する
                </Button>
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* 登録用ダイアログ */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>案件として登録</DialogTitle>
        <DialogContent sx={{ minWidth: 400, mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            以下の顧客に紐づけて案件を登録します。
          </Typography>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>顧客企業を選択</InputLabel>
            <Select
              value={selectedCustomerId}
              label="顧客企業を選択"
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              {customers.map((cust) => (
                <MenuItem key={cust.id} value={cust.id}>
                  {cust.company_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>キャンセル</Button>
          <Button onClick={handleRegister} variant="contained" disabled={registering}>
            {registering ? '登録中...' : '登録実行'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OpportunityAnalyzePage;