import React, { useState, useEffect } from 'react';
import api from './api';
import {
  Container, Typography, Box, Paper, CircularProgress,
  Divider, Accordion, AccordionSummary, AccordionDetails, Chip, Select,
  MenuItem, FormControl, InputLabel, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton // ★★★ Table関連とIconButtonをインポート ★★★
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete'; // ★★★ 削除アイコンをインポート ★★★
import SaveIcon from '@mui/icons-material/Save'; // ★★★ 保存アイコンを追加 ★★★

function EngineerStatusPage() {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);

  // フォーム表示を管理するState
  const [showNewOppForm, setShowNewOppForm] = useState(null); // どのエンジニアのフォームを開くか
  const [newOppCompanyName, setNewOppCompanyName] = useState('');

  // 選択可能なステータスのリスト
  const engineerStatusOptions = ['待機中', '営業中', '参画中'];
  const opportunityStatusOptions = ['提案中', '面談調整中', '結果待ち', '成約', '失注'];

  const fetchEngineers = async () => {
    // fetchDataを再利用可能にするために分離
    setLoading(true);
    try {
      const response = await api.get('/engineers/');
      setEngineers(response.data);
    } catch (error) {
      console.error("エンジニア情報の取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngineers();
  }, []);

  // --- ハンドラ関数 ---

  const handleEngineerStatusChange = async (engineerId, newStatus) => {
    try {
      await api.put(`/engineers/${engineerId}/status`, { status: newStatus });
      setEngineers(prev => prev.map(eng => eng.id === engineerId ? { ...eng, status: newStatus } : eng));
    } catch (error) {
      console.error("エンジニアステータスの更新に失敗しました:", error);
    }
  };

  const handleOpportunityStatusChange = async (engineerId, oppId, newStatus) => {
    try {
      await api.put(`/opportunities/${oppId}/status`, { status: newStatus });
      setEngineers(prev => prev.map(eng => {
        if (eng.id === engineerId) {
          return {
            ...eng,
            opportunities: eng.opportunities.map(opp => opp.id === oppId ? { ...opp, status: newStatus } : opp)
          };
        }
        return eng;
      }));
    } catch (error) {
      console.error("案件ステータスの更新に失敗しました:", error);
    }
  };

  const handleCreateOpportunity = async (engineerId) => {
    if (!newOppCompanyName) {
      alert('企業名を入力してください。');
      return;
    }
    try {
      const newOpp = { company_name: newOppCompanyName, status: '提案中' };
      await api.post(`/engineers/${engineerId}/opportunities/`, newOpp);
      alert('新しい案件を追加しました。');
      setNewOppCompanyName('');
      setShowNewOppForm(null); // フォームを閉じる
      fetchEngineers(); // 最新の情報を再取得
    } catch (error) {
      console.error("案件の追加に失敗しました:", error);
      alert('案件の追加に失敗しました。');
    }
  };

  // ★★★ 新しい関数: 案件削除ハンドラ ★★★
  const handleDeleteOpportunity = async (engineerId, oppId) => {
    if (window.confirm('本当にこの案件を削除しますか？')) {
      try {
        await api.delete(`/opportunities/${oppId}`);
        // 画面表示をリアルタイムに更新
        setEngineers(prev => prev.map(eng => {
          if (eng.id === engineerId) {
            return {
              ...eng,
              opportunities: eng.opportunities.filter(opp => opp.id !== oppId)
            };
          }
          return eng;
        }));
        alert('案件を削除しました。');
      } catch (error) {
        console.error("案件の削除に失敗しました:", error);
        alert('案件の削除に失敗しました。');
      }
    }
  };

  // ★★★ 新しい関数: 案件詳細の入力値を一時的に保持 ★★★
  const handleOppDetailsChange = (engineerId, oppId, field, value) => {
    setEngineers(prev => prev.map(eng => {
      if (eng.id === engineerId) {
        return {
          ...eng,
          opportunities: eng.opportunities.map(opp => 
            opp.id === oppId ? { ...opp, [field]: value } : opp
          )
        };
      }
      return eng;
    }));
  };

  // ★★★ 新しい関数: 案件詳細を保存 ★★★
const handleSaveOppDetails = async (engineerId, oppId) => {
    const engineer = engineers.find(eng => eng.id === engineerId);
    const opportunity = engineer.opportunities.find(opp => opp.id === oppId);

    try {
      await api.put(`/opportunities/${oppId}/details`, {
        company_name: opportunity.company_name,
        notes: opportunity.notes
      });
      alert('案件詳細を保存しました。');
    } catch (error) {
      console.error("案件詳細の保存に失敗しました:", error);
      alert('案件詳細の保存に失敗しました。');
    }
  };

  // --- ヘルパー関数 ---
  const getStatusChipColor = (status) => { /* 変更なし */ };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>エンジニア状況管理</Typography>

        {engineers.map((engineer) => (
          <Accordion key={engineer.id}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography sx={{ flexGrow: 1, mr: 2 }}>{engineer.name}</Typography>
                <Chip label={engineer.status} color={getStatusChipColor(engineer.status)} />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              {/* --- エンジニアのステータス変更 --- */}
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>エンジニアステータス</InputLabel>
                  <Select value={engineer.status} label="エンジニアステータス" onChange={(e) => handleEngineerStatusChange(engineer.id, e.target.value)}>
                    {engineerStatusOptions.map(option => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                  </Select>
                </FormControl>
              </Box>
              <Divider sx={{ my: 2 }} />

              {/* ★★★ ここから下が案件リストのテーブル表示への変更点 ★★★ */}
              <Typography variant="h6">進行中の案件</Typography>
              {engineer.opportunities && engineer.opportunities.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{width: '25%'}}>案件/企業名</TableCell>
                        <TableCell>メモ（自由記載）</TableCell>
                        <TableCell sx={{width: '20%'}}>ステータス</TableCell>
                        <TableCell align="right">操作</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {engineer.opportunities.map((opp) => (
                        <TableRow key={opp.id}>
                         <TableCell>
                            <TextField
                              variant="standard"
                              fullWidth
                              value={opp.company_name}
                              onChange={(e) => handleOppDetailsChange(engineer.id, opp.id, 'company_name', e.target.value)}
                            />
                          </TableCell>
                          {/* ★★★ メモ欄をTextFieldとして追加 ★★★ */}
                          <TableCell>
                            <TextField
                              variant="standard"
                              fullWidth
                              multiline
                              value={opp.notes || ''}
                              onChange={(e) => handleOppDetailsChange(engineer.id, opp.id, 'notes', e.target.value)}
                            />
                          </TableCell>
                          {/* ステータスドロップダウン (変更なし) */}
                          <TableCell>
                            <FormControl size="small" fullWidth>
                              <TableCell>
                            <FormControl size="small" fullWidth>
                              <Select
                                value={opp.status}
                                onChange={(e) => handleOpportunityStatusChange(engineer.id, opp.id, e.target.value)}
                              >
                                {opportunityStatusOptions.map(option => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                              </Select>
                            </FormControl>
                          </TableCell>
                            </FormControl>
                          </TableCell>
                          {/* ★★★ 保存ボタンを追加 ★★★ */}
                          <TableCell align="right">
                             <IconButton onClick={() => handleSaveOppDetails(engineer.id, opp.id)} color="primary">
                                <SaveIcon />
                            </IconButton>
                            <IconButton onClick={() => handleDeleteOpportunity(engineer.id, opp.id)} color="warning">
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : ( <Typography>現在進行中の案件はありません。</Typography> )}
              
              {/* --- 新規案件追加フォーム --- */}
              <Box sx={{ mt: 2 }}>
                {showNewOppForm === engineer.id ? (
                  <Paper sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField label="企業名" size="small" value={newOppCompanyName} onChange={(e) => setNewOppCompanyName(e.target.value)} />
                    <Button variant="contained" onClick={() => handleCreateOpportunity(engineer.id)}>保存</Button>
                    <Button onClick={() => setShowNewOppForm(null)}>キャンセル</Button>
                  </Paper>
                ) : (
                  <Button variant="outlined" onClick={() => setShowNewOppForm(engineer.id)}>新規案件を追加</Button>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
}

export default EngineerStatusPage;