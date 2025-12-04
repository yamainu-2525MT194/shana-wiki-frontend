import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from './api';
import {
  Container, Typography, Box, CircularProgress, Paper, Grid, Card, CardContent,
  Alert, Chip, List, ListItem, ListItemText, ListItemButton, Divider, Button, LinearProgress
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

function DashboardPage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [userResponse, statsResponse, pagesResponse] = await Promise.all([
          api.get('/users/me'),
          api.get('/dashboard/stats'),
          api.get('/pages/all')
        ]);

        if (userResponse.data) setUser(userResponse.data);
        if (statsResponse.data) setStats(statsResponse.data);
        if (pagesResponse.data) setPages(pagesResponse.data);
      } catch (error) {
        console.error('データの取得に失敗しました:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const engineerPieData = stats ? [
    { name: '参画中', value: stats.assigned_engineers, color: '#4caf50' },
    { name: '営業中', value: stats.sales_engineers, color: '#ff9800' },
    { name: '待機中', value: stats.standby_engineers, color: '#f44336' }
  ] : [];

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

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          ようこそ、{user ? user.name : 'ゲスト'}さん！
        </Typography>

        {/* KPIサマリーセクション */}
        <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
          📊 今月の営業サマリー
        </Typography>
        <Grid container spacing={3}>
          {/* 今月の成約数 */}
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: 'success.light', color: 'success.contrastText' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">今月の成約数</Typography>
                </Box>
                <Typography variant="h3">{stats?.monthly_contracts || 0}</Typography>
                <Typography variant="body2">件</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* エンジニア稼働率 */}
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: 'info.light', color: 'info.contrastText' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">稼働率</Typography>
                </Box>
                <Typography variant="h3">{stats?.utilization_rate || 0}%</Typography>
                <Typography variant="body2">
                  参画中: {stats?.assigned_engineers || 0} / {stats?.total_engineers || 0}名
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* 待機中エンジニア */}
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <WarningIcon sx={{ mr: 1 }} />
                  <Typography variant="h6">待機中</Typography>
                </Box>
                <Typography variant="h3">{stats?.standby_engineers || 0}</Typography>
                <Typography variant="body2">営業中: {stats?.sales_engineers || 0}名</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* 未解決トラブル */}
          <Grid item size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ bgcolor: stats?.unresolved_incidents > 0 ? 'error.light' : 'success.light' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {stats?.unresolved_incidents > 0 ? (
                    <WarningIcon sx={{ mr: 1 }} />
                  ) : (
                    <CheckCircleIcon sx={{ mr: 1 }} />
                  )}
                  <Typography variant="h6">未解決トラブル</Typography>
                </Box>
                <Typography variant="h3">{stats?.unresolved_incidents || 0}</Typography>
                <Typography variant="body2">件</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* エンジニア稼働状況とトラブルアラート */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* エンジニア稼働状況グラフ */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                👨‍💻 エンジニア稼働状況
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {stats && engineerPieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={engineerPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}名`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {engineerPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}名`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      稼働率
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={stats.utilization_rate}
                      sx={{ height: 10, borderRadius: 5, mt: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {stats.assigned_engineers} / {stats.total_engineers} 名が参画中
                    </Typography>
                  </Box>
                </>
              ) : (
                <Alert severity="info">データがありません</Alert>
              )}
            </Paper>
          </Grid>

          {/* トラブルアラート */}
          <Grid item size={{ xs: 12, md: 6 }}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  ⚠️ 最近のトラブル
                </Typography>
                <Button component={Link} to="/incidents" size="small">
                  すべて見る
                </Button>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {stats?.recent_incidents && stats.recent_incidents.length > 0 ? (
                <List dense>
                  {stats.recent_incidents.map((incident, index) => (
                    <React.Fragment key={incident.id}>
                      <ListItem>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                label={incident.severity}
                                color={getSeverityColor(incident.severity)}
                                size="small"
                              />
                              <Chip
                                label={incident.status}
                                color={getStatusColor(incident.status)}
                                size="small"
                              />
                              <Typography variant="body2">{incident.title}</Typography>
                            </Box>
                          }
                          secondary={
                            <>
                              {incident.engineer && `担当: ${incident.engineer.name}`}
                              {incident.customer && ` | 顧客: ${incident.customer.company_name}`}
                            </>
                          }
                        />
                      </ListItem>
                      {index < stats.recent_incidents.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Alert severity="success">現在トラブルはありません</Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Wikiページ一覧 */}
        <Box sx={{ mt: 10, mb: 4 }}> {/* 下部にも余白を追加 */}
        <Paper sx={{ p: 3 }}> {/* ★変更点1: ここでPaperを開始し、パディング(p: 3)を追加 */}
          
          {/* ★変更点2: タイトルとボタンをPaperの内部に配置 */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            {/* h5からh6に変更して、他のカードとサイズ感を統一 */}
            <Typography variant="h6">
              📝 Wikiページ一覧
            </Typography>
            
            {user && user.role === 'admin' && (
              <Button component={Link} to="/pages/new" variant="contained" size="small">
                新しいページを作成
              </Button>
            )}
          </Box>
          
          {/* ★変更点3: 区切り線を追加してデザインを統一 */}
          <Divider sx={{ mb: 2 }} />

          <List disablePadding> {/* PaperにpaddingがあるのでListのpaddingは無効化してもOK */}
            {pages && pages.length > 0 ? (
              pages.slice(0, 10).map((page, index) => (
                <React.Fragment key={page.id}>
                  <ListItem disablePadding>
                    <ListItemButton component={Link} to={`/pages/${page.id}`}>
                      <ListItemText
                        primary={page.title}
                        secondary={`更新日: ${new Date(page.updated_at || page.created_at).toLocaleDateString()} | 作成者: ${
                          page.author ? page.author.name : '不明'
                        }`}
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < Math.min(pages.length, 10) - 1 && <Divider component="li" />}
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary="まだページがありません。管理者が新しいページを作成できます。"
                  sx={{ textAlign: 'center', color: 'text.secondary' }}
                />
              </ListItem>
            )}
          </List>
        </Paper>
      </Box>
    </Container>
  );
}

export default DashboardPage;
