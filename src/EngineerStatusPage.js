import React, { useState, useEffect, useMemo } from 'react';
import api from './api';
import {
  Container, Typography, Box, Paper, CircularProgress, Accordion,
  AccordionSummary, AccordionDetails, Chip, Grid, Select, MenuItem,
  FormControl, InputLabel, Button, TextField, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Divider,
  Link as MuiLink, // ★★★ リンクコンポーネントをインポート ★★★
  // ▼▼▼ 以下の4つを追加してください ▼▼▼
  List, ListItem, ListItemButton, ListItemText
} from '@mui/material';
import { Link } from 'react-router-dom'; // ★★★ リンクコンポーネントをインポート ★★★
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArticleIcon from '@mui/icons-material/Article'
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function EngineerStatusPage() {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingEngineerId, setEditingEngineerId] = useState(null);
  const [showNewOppForm, setShowNewOppForm] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [newOppCustomerId, setNewOppCustomerId] = useState('');
  const [newOppNotes, setNewOppNotes] = useState('');

  const engineerStatusOptions = ['待機中', '営業中', '参画中'];
  const opportunityStatusOptions = ['提案中', '面談調整中', '結果待ち', '成約', '失注'];

  // ★★★ データを2つ（エンジニアと顧客）取得する ★★★
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [engineerResponse, customerResponse] = await Promise.all([
        api.get('/engineers/'),
        api.get('/customers/')
      ]);
      setEngineers(engineerResponse.data);
      setCustomers(customerResponse.data);
    } catch (error) { console.error("データの取得に失敗しました:", error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInitialData(); }, []);

  // --- データ集計ロジック ---
  const summaryData = useMemo(() => {
    const counts = { '待機中': 0, '営業中': 0, '参画中': 0 };
    engineers.forEach(engineer => { if (counts[engineer.status] !== undefined) { counts[engineer.status]++; } });
    return { total: engineers.length, standby: counts['待機中'], sales: counts['営業中'], assigned: counts['参画中'] };
  }, [engineers]);

  const pieChartData = [
    { name: '待機中', value: summaryData.standby },
    { name: '営業中', value: summaryData.sales },
    { name: '参画中', value: summaryData.assigned },
  ];
  const COLORS = ['#f44336', '#ff9800', '#4caf50'];
  const getStatusChipColor = (status) => { switch (status) { case '参画中': return 'success'; case '営業中': return 'warning'; case '待機中': return 'error'; default: return 'default'; } };

  // --- エンジニア関連ハンドラ ---
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
    } catch (error) { alert('エンジニア情報の更新に失敗しました。'); fetchInitialData(); }
  };
  const handleEngineerStatusChange = async (engineerId, newStatus) => {
    try {
      await api.put(`/engineers/update-status/${engineerId}`, { status: newStatus });
      setEngineers(prev => prev.map(eng => eng.id === engineerId ? { ...eng, status: newStatus } : eng));
    } catch (error) { console.error("エンジニアステータスの更新に失敗しました:", error); }
  };

  // --- 案件(Opportunity)関連ハンドラ ---
  const handleCreateOpportunity = async (engineerId) => {
    if (!newOppCustomerId) { alert('顧客を選択してください。'); return; }
    try {
      const newOpp = { customer_id: parseInt(newOppCustomerId, 10), status: '提案中', notes: newOppNotes };
      await api.post(`/engineers/${engineerId}/opportunities/`, newOpp);
      alert('新しい案件を追加しました。');
      setNewOppCustomerId('');
      setNewOppNotes('');
      setShowNewOppForm(null);
      fetchInitialData(); 
    } catch (error) { console.error("案件の追加に失敗しました:", error); alert('案件の追加に失敗しました。'); }
  };
  
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

  const handleSaveOppDetails = async (engineerId, oppId) => {
    const engineer = engineers.find(eng => eng.id === engineerId);
    const opportunity = engineer.opportunities.find(opp => opp.id === oppId);
    try {
      await api.put(`/opportunities/${oppId}/details`, {
        notes: opportunity.notes
      });
      alert('案件メモを保存しました。');
    } catch (error) { console.error("案件詳細の保存に失敗しました:", error); alert('案件詳細の保存に失敗しました。'); }
  };

  const handleOpportunityStatusChange = async (engineerId, oppId, newStatus) => { 
    try { 
      await api.put(`/opportunities/${oppId}/status`, { status: newStatus }); 
      setEngineers(prev => prev.map(eng => eng.id === engineerId ? { ...eng, opportunities: eng.opportunities.map(opp => opp.id === oppId ? { ...opp, status: newStatus } : opp) } : eng)); 
    } catch (error) { console.error("案件ステータスの更新に失敗しました:", error); } 
  };
  
  const handleDeleteOpportunity = async (engineerId, oppId) => { 
    if (window.confirm('本当にこの案件を削除しますか？')) { 
      try { 
        await api.delete(`/opportunities/${oppId}`); 
        setEngineers(prev => prev.map(eng => eng.id === engineerId ? { ...eng, opportunities: eng.opportunities.filter(opp => opp.id !== oppId) } : eng)); 
      } catch (error) { alert('案件の削除に失敗しました。'); } 
    } 
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;

 return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          エンジニア状況管理
        </Typography>

        {/* --- ダッシュボードセクション --- */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* --- サマリーカード --- */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">総エンジニア数</Typography>
              <Typography variant="h4">{summaryData.total}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">待機中</Typography>
              <Typography variant="h4" color="error">{summaryData.standby}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">営業中</Typography>
              <Typography variant="h4" color="warning.main">{summaryData.sales}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">参画中</Typography>
              <Typography variant="h4" color="success.main">{summaryData.assigned}</Typography>
            </Paper>
          </Grid>
          
          {/* --- グラフ --- */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2, height: 300 }}>
              <Typography variant="h6" gutterBottom>ステータス内訳</Typography>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    outerRadius={70}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}人`} />
                  <Legend verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>
        {/* --- ダッシュボードセクション ここまで --- */}


        {/* --- エンジニア一覧リスト (編集機能も全て含む) --- */}
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
                {/* --- エンジニア情報（通常表示 or 編集フォーム） --- */}
                {isEditing ? (
                  <Box>
                    <TextField label="エンジニア名" defaultValue={engineer.name} onChange={(e) => handleEngineerDetailsChange(engineer.id, 'name', e.target.value)} fullWidth margin="normal" />
                    <TextField label="スキル (カンマ区切り)" defaultValue={engineer.skills || ''} onChange={(e) => handleEngineerDetailsChange(engineer.id, 'skills', e.target.value)} fullWidth margin="normal" helperText="例: Java,React,AWS" />
                    <Box mt={2}>
                      <Button onClick={() => handleSaveEngineerDetails(engineer.id)} variant="contained" startIcon={<SaveIcon />}>保存</Button>
                      <Button onClick={() => { setEditingEngineerId(null); fetchInitialData(); }} sx={{ml: 1}}>キャンセル</Button>
                    </Box>
                  </Box>
                ) : (
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

                <Box sx={{ mt: 3 }}>
                 <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                    <ArticleIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      関連Wikiページ
                    </Typography>
      
                  {engineer.pages && engineer.pages.length > 0 ? (
                    <List dense>
                      {engineer.pages.map((page) => (
                        <ListItem key={page.id} disablePadding>
                          <ListItemButton component={Link} to={`/pages/${page.id}`}>
                            <ListItemText 
                              primary={page.title} 
                              secondary={new Date(page.updated_at || page.created_at).toLocaleDateString()}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                      関連するページはありません
                    </Typography>
                  )}
                </Box>
                
                {/* --- 案件テーブル --- */}
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
                            <TableCell component="th" scope="row">
                              <MuiLink component={Link} to={`/opportunities/${opp.id}`} underline="hover">
                                {opp.customer ? opp.customer.company_name : '（顧客未定）'}
                              </MuiLink>
                            </TableCell>
                            <TableCell><TextField variant="standard" fullWidth multiline defaultValue={opp.notes || ''} onChange={(e) => handleOppDetailsChange(engineer.id, opp.id, 'notes', e.target.value)}/></TableCell>
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
                
                {/* --- 新規案件追加フォーム --- */}
                <Box sx={{ mt: 2 }}>
                  {showNewOppForm === engineer.id ? (
                    <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel id="customer-select-label">顧客を選択</InputLabel>
                        <Select
                          labelId="customer-select-label"
                          value={newOppCustomerId}
                          label="顧客を選択"
                          onChange={(e) => setNewOppCustomerId(e.target.value)}
                        >
                          {customers.map((customer) => (
                            <MenuItem key={customer.id} value={customer.id}>
                              {customer.company_name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField label="初期メモ (任意)" size="small" value={newOppNotes} onChange={(e) => setNewOppNotes(e.target.value)} />
                      <Box>
                        <Button variant="contained" onClick={() => handleCreateOpportunity(engineer.id)}>保存</Button>
                        <Button onClick={() => setShowNewOppForm(null)} sx={{ml: 1}}>キャンセル</Button>
                      </Box>
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