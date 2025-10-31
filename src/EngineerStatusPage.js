import React, { useState, useEffect, useMemo } from 'react';
import api from './api';
import {
  Container, Typography, Box, Paper, CircularProgress, Accordion,
  AccordionSummary, AccordionDetails, Chip, Grid, Select, MenuItem,
  FormControl, InputLabel, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function EngineerStatusPage() {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEngineerId, setEditingEngineerId] = useState(null); // 編集モードのエンジニアIDを管理
  const [showNewOppForm, setShowNewOppForm] = useState(null);
  const [newOppCompanyName, setNewOppCompanyName] = useState('');

  const engineerStatusOptions = ['待機中', '営業中', '参画中'];
  const opportunityStatusOptions = ['提案中', '面談調整中', '結果待ち', '成約', '失注'];

  const fetchEngineers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/engineers/');
      setEngineers(response.data);
    } catch (error) { console.error("エンジニア情報の取得に失敗しました:", error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEngineers(); }, []);

  const summaryData = useMemo(() => {
    const counts = { '待機中': 0, '営業中': 0, '参画中': 0, };
    engineers.forEach(engineer => { if (counts[engineer.status] !== undefined) { counts[engineer.status]++; } });
    return { total: engineers.length, standby: counts['待機中'], sales: counts['営業中'], assigned: counts['参画中'], };
  }, [engineers]);

  const pieChartData = [
    { name: '待機中', value: summaryData.standby },
    { name: '営業中', value: summaryData.sales },
    { name: '参画中', value: summaryData.assigned },
  ];
  const COLORS = ['#f44336', '#ff9800', '#4caf50'];

  const handleEngineerDetailsChange = (engineerId, field, value) => {
    setEngineers(prev => prev.map(eng =>
      eng.id === engineerId ? { ...eng, [field]: value } : eng
    ));
  };

  const handleSaveEngineerDetails = async (engineerId) => {
    const engineer = engineers.find(eng => eng.id === engineerId);
    try {
      await api.put(`/engineers/${engineerId}`, { name: engineer.name, skills: engineer.skills, status: engineer.status });
      alert('エンジニア情報を更新しました。');
      setEditingEngineerId(null);
    } catch (error) {
      alert('エンジニア情報の更新に失敗しました。');
      fetchEngineers(); // 失敗時に元のデータに戻す
    }
  };
  
  // 他のハンドラ関数 (案件関連など)
  const handleEngineerStatusChange = async (engineerId, newStatus) => { try { await api.put(`/engineers/${engineerId}/status`, { status: newStatus }); setEngineers(prev => prev.map(eng => eng.id === engineerId ? { ...eng, status: newStatus } : eng)); } catch (error) { console.error("エンジニアステータスの更新に失敗しました:", error); } };
  const handleOpportunityStatusChange = async (engineerId, oppId, newStatus) => { try { await api.put(`/opportunities/${oppId}/status`, { status: newStatus }); setEngineers(prev => prev.map(eng => eng.id === engineerId ? { ...eng, opportunities: eng.opportunities.map(opp => opp.id === oppId ? { ...opp, status: newStatus } : opp) } : eng)); } catch (error) { console.error("案件ステータスの更新に失敗しました:", error); } };
  const handleCreateOpportunity = async (engineerId) => { if (!newOppCompanyName) return; try { const newOpp = { company_name: newOppCompanyName, status: '提案中' }; await api.post(`/engineers/${engineerId}/opportunities/`, newOpp); setNewOppCompanyName(''); setShowNewOppForm(null); fetchEngineers(); } catch (error) { alert('案件の追加に失敗しました。'); } };
  const handleDeleteOpportunity = async (engineerId, oppId) => { if (window.confirm('本当にこの案件を削除しますか？')) { try { await api.delete(`/opportunities/${oppId}`); setEngineers(prev => prev.map(eng => eng.id === engineerId ? { ...eng, opportunities: eng.opportunities.filter(opp => opp.id !== oppId) } : eng)); } catch (error) { alert('案件の削除に失敗しました。'); } } };
  const handleOppDetailsChange = (engineerId, oppId, field, value) => { setEngineers(prev => prev.map(eng => eng.id === engineerId ? { ...eng, opportunities: eng.opportunities.map(opp => opp.id === oppId ? { ...opp, [field]: value } : opp) } : eng)); };
  const handleSaveOppDetails = async (engineerId, oppId) => { const engineer = engineers.find(eng => eng.id === engineerId); const opportunity = engineer.opportunities.find(opp => opp.id === oppId); try { await api.put(`/opportunities/${oppId}/details`, { company_name: opportunity.company_name, notes: opportunity.notes }); alert('案件詳細を保存しました。'); } catch (error) { alert('案件詳細の保存に失敗しました。'); } };
  const getStatusChipColor = (status) => { switch (status) { case '参画中': return 'success'; case '営業中': return 'warning'; case '待機中': return 'error'; default: return 'default'; } };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>エンジニア状況管理</Typography>
        
        {/* ダッシュボードセクション */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">総エンジニア数</Typography><Typography variant="h4">{summaryData.total}</Typography></Paper></Grid>
          <Grid item xs={12} sm={6} md={3}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">待機中</Typography><Typography variant="h4" color="error">{summaryData.standby}</Typography></Paper></Grid>
          <Grid item xs={12} sm={6} md={3}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">営業中</Typography><Typography variant="h4" color="warning.main">{summaryData.sales}</Typography></Paper></Grid>
          <Grid item xs={12} sm={6} md={3}><Paper sx={{ p: 2, textAlign: 'center' }}><Typography variant="h6">参画中</Typography><Typography variant="h4" color="success.main">{summaryData.assigned}</Typography></Paper></Grid>
          <Grid item xs={12}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="h6" gutterBottom>ステータス内訳</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie data={pieChartData} cx="50%" cy="45%" labelLine={false} outerRadius={70} fill="#8884d8" dataKey="value" nameKey="name">
                    {pieChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}人`} />
                  <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* エンジニア一覧リスト */}
        {engineers.map((engineer) => {
          const isEditing = editingEngineerId === engineer.id;
          return (
            <Accordion key={engineer.id} TransitionProps={{ unmountOnExit: true }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Typography sx={{ flexGrow: 1, mr: 2 }}>{engineer.name}</Typography>
                  <Chip label={engineer.status} color={getStatusChipColor(engineer.status)} />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {isEditing ? (
                  // --- 編集モード ---
                  <Box>
                    <TextField label="エンジニア名" defaultValue={engineer.name} onChange={(e) => handleEngineerDetailsChange(engineer.id, 'name', e.target.value)} fullWidth margin="normal" />
                    <TextField label="スキル (カンマ区切り)" defaultValue={engineer.skills || ''} onChange={(e) => handleEngineerDetailsChange(engineer.id, 'skills', e.target.value)} fullWidth margin="normal" helperText="例: Java,React,AWS" />
                    <Box mt={2}>
                      <Button onClick={() => handleSaveEngineerDetails(engineer.id)} variant="contained" startIcon={<SaveIcon />}>保存</Button>
                      <Button onClick={() => { setEditingEngineerId(null); fetchEngineers(); }} sx={{ml: 1}}>キャンセル</Button>
                    </Box>
                  </Box>
                ) : (
                  // --- 通常表示モード ---
                  <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>エンジニアステータス</InputLabel>
                        <Select value={engineer.status} label="エンジニアステータス" onChange={(e) => handleEngineerStatusChange(engineer.id, e.target.value)}>
                          {engineerStatusOptions.map(option => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                        </Select>
                      </FormControl>
                      <Button onClick={() => setEditingEngineerId(engineer.id)} startIcon={<EditIcon />}>エンジニア情報を編集</Button>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary">保有スキル</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {engineer.skills ? ( engineer.skills.split(',').map((skill, index) => ( <Chip key={index} label={skill.trim()} size="small" /> )) ) : ( <Typography variant="body2" color="text.secondary">スキル未登録</Typography> )}
                      </Box>
                    </Box>
                  </Box>
                )}
                <Divider sx={{ my: 2 }} />
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
                          <TableCell><TextField variant="standard" fullWidth value={opp.company_name} onChange={(e) => handleOppDetailsChange(engineer.id, opp.id, 'company_name', e.target.value)} /></TableCell>
                          <TableCell><TextField variant="standard" fullWidth multiline value={opp.notes || ''} onChange={(e) => handleOppDetailsChange(engineer.id, opp.id, 'notes', e.target.value)}/></TableCell>
                          <TableCell>
                            <FormControl size="small" fullWidth>
                              <Select value={opp.status} onChange={(e) => handleOpportunityStatusChange(engineer.id, opp.id, e.target.value)}>
                                {opportunityStatusOptions.map(option => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                              </Select>
                            </FormControl>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton onClick={() => handleSaveOppDetails(engineer.id, opp.id)} color="primary"><SaveIcon /></IconButton>
                            <IconButton onClick={() => handleDeleteOpportunity(engineer.id, opp.id)} color="warning"><DeleteIcon /></IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : ( <Typography>現在進行中の案件はありません。</Typography> )}
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
          );
        })}
      </Box>
    </Container>
  );
}

export default EngineerStatusPage;