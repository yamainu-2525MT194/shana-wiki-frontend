import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './api';
import {
  Container, Typography, Box, Paper, CircularProgress, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel, Select, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, IconButton,
  Grid, Card, CardContent, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';

function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: '中',
    status: '未対応',
    engineer_id: '',
    customer_id: '',
    assignee_id: ''
  });

  const severityOptions = ['高', '中', '低'];
  const statusOptions = ['未対応', '対応中', '解決済み'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [incidentsRes, engineersRes, customersRes, usersRes] = await Promise.all([
        api.get('/incidents/'),
        api.get('/engineers/'),
        api.get('/customers/'),
        api.get('/users/')
      ]);
      setIncidents(incidentsRes.data);
      setEngineers(engineersRes.data);
      setCustomers(customersRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = (incident = null) => {
    if (incident) {
      setEditingIncident(incident);
      setFormData({
        title: incident.title,
        description: incident.description || '',
        severity: incident.severity,
        status: incident.status,
        engineer_id: incident.engineer_id || '',
        customer_id: incident.customer_id || '',
        assignee_id: incident.assignee_id || ''
      });
    } else {
      setEditingIncident(null);
      setFormData({
        title: '',
        description: '',
        severity: '中',
        status: '未対応',
        engineer_id: '',
        customer_id: '',
        assignee_id: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingIncident(null);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        engineer_id: formData.engineer_id || null,
        customer_id: formData.customer_id || null,
        assignee_id: formData.assignee_id || null
      };

      if (editingIncident) {
        await api.put(`/incidents/${editingIncident.id}`, payload);
        alert('トラブル情報を更新しました');
      } else {
        await api.post('/incidents/', payload);
        alert('トラブルを登録しました');
      }
      handleCloseDialog();
      fetchData();
    } catch (error) {
      console.error('保存に失敗しました:', error);
      alert('保存に失敗しました');
    }
  };

  const handleDelete = async (incidentId) => {
    if (!window.confirm('このトラブルを削除しますか？')) return;
    try {
      await api.delete(`/incidents/${incidentId}`);
      alert('トラブルを削除しました');
      fetchData();
    } catch (error) {
      console.error('削除に失敗しました:', error);
      alert('削除に失敗しました');
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case '高': return 'error';
      case '中': return 'warning';
      case '低': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '解決済み': return 'success';
      case '対応中': return 'warning';
      case '未対応': return 'error';
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

  const unresolvedCount = incidents.filter(i => i.status !== '解決済み').length;
  const highSeverityCount = incidents.filter(i => i.severity === '高' && i.status !== '解決済み').length;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            ⚠️ トラブル管理
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            新規トラブル登録
          </Button>
        </Box>

        {/* サマリーカード */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary">総トラブル数</Typography>
                <Typography variant="h3">{incidents.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: 'warning.light' }}>
              <CardContent>
                <Typography variant="h6">未解決</Typography>
                <Typography variant="h3">{unresolvedCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card sx={{ bgcolor: highSeverityCount > 0 ? 'error.light' : 'success.light' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <WarningIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">高重要度（未解決）</Typography>
                </Box>
                <Typography variant="h3">{highSeverityCount}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {highSeverityCount > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            高重要度の未解決トラブルが {highSeverityCount} 件あります。早急な対応が必要です。
          </Alert>
        )}

        {/* トラブル一覧テーブル */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>重要度</TableCell>
                <TableCell>ステータス</TableCell>
                <TableCell>タイトル</TableCell>
                <TableCell>エンジニア</TableCell>
                <TableCell>顧客</TableCell>
                <TableCell>担当者</TableCell>
                <TableCell>報告日</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {incidents.length > 0 ? (
                incidents.map((incident) => (
                  <TableRow key={incident.id} hover>
                    <TableCell>
                      <Chip label={incident.severity} color={getSeverityColor(incident.severity)} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={incident.status} color={getStatusColor(incident.status)} size="small" />
                    </TableCell>
                    <TableCell><Link to={`/incidents/${incident.id}`} 
                      style={{ textDecoration: 'none', fontWeight: 'bold', color: '#1976d2' }}>
                      {incident.title}
                    </Link></TableCell>
                    <TableCell>
                      {incident.engineer ? (
                        <Link to={`/engineers/${incident.engineer_id}`} style={{ textDecoration: 'none' }}>
                          {incident.engineer.name}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {incident.customer ? (
                        <Link to={`/customers/${incident.customer_id}`} style={{ textDecoration: 'none' }}>
                          {incident.customer.company_name}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{incident.assignee ? incident.assignee.name : '未割当'}</TableCell>
                    <TableCell>{new Date(incident.reported_at).toLocaleDateString()}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpenDialog(incident)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(incident.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Alert severity="success">現在トラブルはありません</Alert>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* トラブル登録・編集ダイアログ */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingIncident ? 'トラブル編集' : '新規トラブル登録'}</DialogTitle>
        <DialogContent>
          <TextField
            label="タイトル"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="詳細説明"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>重要度</InputLabel>
                <Select
                  value={formData.severity}
                  label="重要度"
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                >
                  {severityOptions.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>ステータス</InputLabel>
                <Select
                  value={formData.status}
                  label="ステータス"
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  {statusOptions.map(option => (
                    <MenuItem key={option} value={option}>{option}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>関連エンジニア</InputLabel>
                <Select
                  value={formData.engineer_id}
                  label="関連エンジニア"
                  onChange={(e) => setFormData({ ...formData, engineer_id: e.target.value })}
                >
                  <MenuItem value="">なし</MenuItem>
                  {engineers.map(eng => (
                    <MenuItem key={eng.id} value={eng.id}>{eng.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>関連顧客</InputLabel>
                <Select
                  value={formData.customer_id}
                  label="関連顧客"
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                >
                  <MenuItem value="">なし</MenuItem>
                  {customers.map(cust => (
                    <MenuItem key={cust.id} value={cust.id}>{cust.company_name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>対応担当者</InputLabel>
                <Select
                  value={formData.assignee_id}
                  label="対応担当者"
                  onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                >
                  <MenuItem value="">未割当</MenuItem>
                  {users.map(user => (
                    <MenuItem key={user.id} value={user.id}>{user.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>キャンセル</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingIncident ? '更新' : '登録'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default IncidentsPage;
