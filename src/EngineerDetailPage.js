import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from './api';
import {
  Container, Typography, Box, Paper, CircularProgress, Tabs, Tab,
  Chip, Grid, Button, TextField, Divider, Card, CardContent,
  List, ListItem, ListItemText, ListItemButton, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem,
  Alert, Link as MuiLink
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ArticleIcon from '@mui/icons-material/Article';
import BusinessIcon from '@mui/icons-material/Business';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';

function EngineerDetailPage() {
  const { engineerId } = useParams();
  const navigate = useNavigate();
  
  const [engineer, setEngineer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', skills: '', status: '' });
  
  // 新規案件追加用
  const [showNewOppDialog, setShowNewOppDialog] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [newOppCustomerId, setNewOppCustomerId] = useState('');
  const [newOppNotes, setNewOppNotes] = useState('');

  const engineerStatusOptions = ['待機中', '営業中', '参画中'];
  const opportunityStatusOptions = ['提案中', '面談調整中', '結果待ち', '成約', '失注'];

  // エンジニア情報取得
  const fetchEngineer = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/engineers/${engineerId}`);
      setEngineer(response.data);
      setEditForm({
        name: response.data.name,
        skills: response.data.skills || '',
        status: response.data.status
      });
    } catch (error) {
      console.error('エンジニア情報の取得に失敗しました:', error);
      alert('エンジニア情報の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 顧客リスト取得
  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers/');
      setCustomers(response.data);
    } catch (error) {
      console.error('顧客リストの取得に失敗しました:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchEngineer();
      await fetchCustomers();
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engineerId]);

  // エンジニア情報更新
  const handleSaveEngineer = async () => {
    try {
      await api.put(`/engineers/${engineerId}`, editForm);
      alert('エンジニア情報を更新しました');
      setIsEditing(false);
      fetchEngineer();
    } catch (error) {
      console.error('更新に失敗しました:', error);
      alert('更新に失敗しました');
    }
  };

  // ステータス変更
  const handleStatusChange = async (newStatus) => {
    try {
      await api.put(`/engineers/update-status/${engineerId}`, { status: newStatus });
      setEngineer(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('ステータス更新に失敗しました:', error);
    }
  };

  // 新規案件追加
  const handleCreateOpportunity = async () => {
    if (!newOppCustomerId) {
      alert('顧客を選択してください');
      return;
    }
    try {
      await api.post(`/engineers/${engineerId}/opportunities/`, {
        customer_id: parseInt(newOppCustomerId, 10),
        status: '提案中',
        notes: newOppNotes
      });
      alert('案件を追加しました');
      setShowNewOppDialog(false);
      setNewOppCustomerId('');
      setNewOppNotes('');
      fetchEngineer();
    } catch (error) {
      console.error('案件追加に失敗しました:', error);
      alert('案件追加に失敗しました');
    }
  };

  // 案件ステータス変更
  const handleOppStatusChange = async (oppId, newStatus) => {
    try {
      await api.put(`/opportunities/${oppId}/status`, { status: newStatus });
      setEngineer(prev => ({
        ...prev,
        opportunities: prev.opportunities.map(opp =>
          opp.id === oppId ? { ...opp, status: newStatus } : opp
        )
      }));
    } catch (error) {
      console.error('案件ステータス更新に失敗しました:', error);
    }
  };

  // 案件削除
  const handleDeleteOpportunity = async (oppId) => {
    if (!window.confirm('この案件を削除しますか？')) return;
    try {
      await api.delete(`/opportunities/${oppId}`);
      setEngineer(prev => ({
        ...prev,
        opportunities: prev.opportunities.filter(opp => opp.id !== oppId)
      }));
    } catch (error) {
      console.error('案件削除に失敗しました:', error);
      alert('案件削除に失敗しました');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '参画中': return 'success';
      case '営業中': return 'warning';
      case '待機中': return 'error';
      default: return 'default';
    }
  };

  const getOppStatusColor = (status) => {
    switch (status) {
      case '成約': return 'success';
      case '失注': return 'error';
      case '提案中': return 'info';
      case '面談調整中': return 'warning';
      case '結果待ち': return 'default';
      default: return 'default';
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!engineer) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Alert severity="error">エンジニア情報が見つかりませんでした</Alert>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/engineers')} sx={{ mt: 2 }}>
            一覧に戻る
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* ヘッダー */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/engineers')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
            {engineer.name}
          </Typography>
          <Chip label={engineer.status} color={getStatusColor(engineer.status)} size="large" />
        </Box>

        {/* タブナビゲーション */}
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
            <Tab label="基本情報" />
            <Tab label="案件管理" />
            <Tab label="ドキュメント" />
          </Tabs>
        </Paper>

        {/* タブ1: 基本情報 */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {/* 基本情報カード */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">基本情報</Typography>
                    {!isEditing && (
                      <Button startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
                        編集
                      </Button>
                    )}
                  </Box>
                  <Divider sx={{ mb: 2 }} />

                  {isEditing ? (
                    <Box>
                      <TextField
                        label="エンジニア名"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        fullWidth
                        margin="normal"
                      />
                      <TextField
                        label="スキル (カンマ区切り)"
                        value={editForm.skills}
                        onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })}
                        fullWidth
                        margin="normal"
                        helperText="例: Java, React, AWS"
                        multiline
                        rows={3}
                      />
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveEngineer}>
                          保存
                        </Button>
                        <Button onClick={() => { setIsEditing(false); setEditForm({ name: engineer.name, skills: engineer.skills || '', status: engineer.status }); }}>
                          キャンセル
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        名前
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {engineer.name}
                      </Typography>

                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        ステータス
                      </Typography>
                      <FormControl size="small" sx={{ mb: 2, minWidth: 150 }}>
                        <Select value={engineer.status} onChange={(e) => handleStatusChange(e.target.value)}>
                          {engineerStatusOptions.map(option => (
                            <MenuItem key={option} value={option}>{option}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        保有スキル
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {engineer.skills ? (
                          engineer.skills.split(',').map((skill, index) => (
                            <Chip key={index} label={skill.trim()} size="small" />
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            スキル未登録
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* 案件サマリーカード */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>案件サマリー</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light' }}>
                        <Typography variant="h4">{engineer.opportunities?.length || 0}</Typography>
                        <Typography variant="body2">総案件数</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                        <Typography variant="h4">
                          {engineer.opportunities?.filter(opp => opp.status === '成約').length || 0}
                        </Typography>
                        <Typography variant="body2">成約件数</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
                        <Typography variant="h4">
                          {engineer.opportunities?.filter(opp => ['提案中', '面談調整中', '結果待ち'].includes(opp.status)).length || 0}
                        </Typography>
                        <Typography variant="body2">進行中</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.light' }}>
                        <Typography variant="h4">
                          {engineer.opportunities?.filter(opp => opp.status === '失注').length || 0}
                        </Typography>
                        <Typography variant="body2">失注件数</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* タブ2: 案件管理 */}
        {tabValue === 1 && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">案件一覧</Typography>
              <Button variant="contained" startIcon={<BusinessIcon />} onClick={() => setShowNewOppDialog(true)}>
                新規案件追加
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {engineer.opportunities && engineer.opportunities.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>企業名</TableCell>
                      <TableCell>ステータス</TableCell>
                      <TableCell>メモ</TableCell>
                      <TableCell align="right">操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {engineer.opportunities.map((opp) => (
                      <TableRow key={opp.id} hover>
                        <TableCell>
                          <MuiLink component={Link} to={`/opportunities/${opp.id}`} underline="hover">
                            {opp.customer ? opp.customer.company_name : '（顧客情報なし）'}
                          </MuiLink>
                        </TableCell>
                        <TableCell>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={opp.status}
                              onChange={(e) => handleOppStatusChange(opp.id, e.target.value)}
                            >
                              {opportunityStatusOptions.map(option => (
                                <MenuItem key={option} value={option}>
                                  <Chip label={option} color={getOppStatusColor(option)} size="small" />
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell sx={{ maxWidth: 300 }}>
                          <Typography variant="body2" noWrap>
                            {opp.notes || '（メモなし）'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteOpportunity(opp.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">現在進行中の案件はありません</Alert>
            )}
          </Paper>
        )}

        {/* タブ3: ドキュメント */}
        {tabValue === 2 && (
          <Grid container spacing={3}>
            {/* 関連Wikiページ */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <ArticleIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">関連Wikiページ</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
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
                    <Alert severity="info">関連するページはありません</Alert>
                  )}
                  <Button
                    component={Link}
                    to="/pages/new"
                    variant="outlined"
                    fullWidth
                    sx={{ mt: 2 }}
                    startIcon={<ArticleIcon />}
                  >
                    新規ページ作成
                  </Button>
                </CardContent>
              </Card>
            </Grid>

            {/* スキルシート・ドキュメント */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DescriptionIcon sx={{ mr: 1 }} />
                    <Typography variant="h6">スキルシート・資料</Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Alert severity="info" sx={{ mb: 2 }}>
                    スキルシートのアップロード機能は近日実装予定です
                  </Alert>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<UploadFileIcon />}
                    disabled
                  >
                    ファイルをアップロード（準備中）
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* 新規案件追加ダイアログ */}
      <Dialog open={showNewOppDialog} onClose={() => setShowNewOppDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>新規案件追加</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>顧客を選択</InputLabel>
            <Select
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
          <TextField
            label="メモ（任意）"
            value={newOppNotes}
            onChange={(e) => setNewOppNotes(e.target.value)}
            fullWidth
            multiline
            rows={3}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewOppDialog(false)}>キャンセル</Button>
          <Button onClick={handleCreateOpportunity} variant="contained">追加</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default EngineerDetailPage;
