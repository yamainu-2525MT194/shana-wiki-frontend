import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from './api';
import {
  Container, Typography, Box, Paper, CircularProgress, Button, Grid, Chip,
  Divider, List, ListItem, ListItemText, Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';

function IncidentDetailPage() {
  const { incidentId } = useParams(); // URLからIDを取得
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchIncidentDetails = useCallback(async () => {
    try {
      const response = await api.get(`/incidents/${incidentId}`);
      setIncident(response.data);
    } catch (err) {
      console.error("トラブル詳細の取得に失敗しました:", err);
      setError("データの取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  }, [incidentId]);

  useEffect(() => {
    fetchIncidentDetails();
  }, [fetchIncidentDetails]);

  // ステータスに応じた色分け
  const getStatusColor = (status) => {
    switch (status) {
      case '未対応': return 'error';
      case '対応中': return 'warning';
      case '解決済み': return 'success';
      default: return 'default';
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!incident) return <Typography>データが見つかりません。</Typography>;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        {/* ヘッダー部分 */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button component={Link} to="/incidents" startIcon={<ArrowBackIcon />}>
            一覧に戻る
          </Button>
          <Button 
            variant="contained" 
            startIcon={<EditIcon />} 
            onClick={() => alert("編集機能は次回実装予定です")} // 必要に応じて編集モーダル等を実装
          >
            編集
          </Button>
        </Box>

        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
           {incident.title}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Chip label={incident.status} color={getStatusColor(incident.status)} sx={{ mr: 1 }} />
          <Chip label={`重要度: ${incident.severity}`} variant="outlined" />
        </Box>

        <Grid container spacing={3}>
          {/* 左カラム: 詳細情報 */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>トラブル詳細・経緯</Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {incident.description || "詳細な記載はありません。"}
              </Typography>
            </Paper>
          </Grid>

          {/* 右カラム: 関連情報 */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>関連情報</Typography>
              <List dense>
                <ListItem>
                  <ListItemText 
                    primary="発生日時 (報告日)" 
                    secondary={new Date(incident.reported_at).toLocaleDateString()} 
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="関連エンジニア" 
                    secondary={incident.engineer ? (
                      <Link to={`/engineers/${incident.engineer.id}`}>{incident.engineer.name}</Link>
                    ) : "未設定"} 
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="関連顧客" 
                    secondary={incident.customer ? (
                      <Link to={`/customers/${incident.customer.id}`}>{incident.customer.company_name}</Link>
                    ) : "未設定"} 
                  />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemText 
                    primary="担当者" 
                    secondary={incident.assignee ? incident.assignee.name : "未割り当て"} 
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default IncidentDetailPage;