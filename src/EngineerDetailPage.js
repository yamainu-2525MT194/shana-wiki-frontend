import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from './api';
import {
  Container, Typography, Box, Paper, CircularProgress, Button, Grid, Chip,
  TextField, FormControl, Select, MenuItem,
  Alert, Divider, Avatar, Tabs, Tab, Stack, IconButton,
  Card, CardContent, CardHeader, List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CurrencyYenIcon from '@mui/icons-material/CurrencyYen';
import TrainIcon from '@mui/icons-material/Train';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import WorkIcon from '@mui/icons-material/Work';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';

const getStatusColor = (status) => {
  switch (status) {
    case '稼働中': return 'success';
    case '参画中': return 'success';
    case '待機中': return 'error';
    case '営業中': return 'warning';
    default: return 'default';
  }
};

function EngineerDetailPage() {
  const { engineerId } = useParams();
  const [engineer, setEngineer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  
  // 編集用データ（営業項目を追加）
  const [editData, setEditData] = useState({ 
      status: '', 
      skills: '', 
      memo: '',
      unit_price: '',
      nearest_station: '',
      available_date: '',
      contract_type: ''
  });
  
  // ファイルアップロード関連
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const fileInputRef = useRef(null);
  
  const fetchEngineerDetails = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get(`/engineers/${engineerId}`); 
      setEngineer(response.data);
      // DBから取得した値を編集用Stateにセット
      setEditData({
        status: response.data.status,
        skills: response.data.skills || '',
        memo: response.data.memo || '',
        unit_price: response.data.unit_price || '',
        nearest_station: response.data.nearest_station || '',
        available_date: response.data.available_date || '',
        contract_type: response.data.contract_type || ''
      });
    } catch (error) {
      console.error("エンジニア詳細の取得に失敗しました:", error);
    } finally {
      setLoading(false);
    }
  }, [engineerId]);

  useEffect(() => {
    fetchEngineerDetails();
  }, [fetchEngineerDetails]);
  
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type !== 'application/pdf') {
        setUploadResult({ success: false, message: 'PDFファイルを選択してください。' });
        setSelectedFile(null);
    } else {
        setSelectedFile(file);
        setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadResult(null);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
        const response = await api.post(`/engineers/${engineerId}/upload-skill-sheet`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.status === 200 || response.status === 202) {
            const data = response.data;
            setUploadResult({ 
                success: true, 
                message: `PDF解析完了。ステータス更新: ${data.new_status}` 
            });
            fetchEngineerDetails(); 
            setTabValue(1); 
        } 
    } catch (error) {
        console.error("Upload error:", error);
        const errorMessage = error.response?.data?.detail || 'アップロードに失敗しました。';
        setUploadResult({ success: false, message: `アップロード失敗: ${errorMessage}` });
    } finally {
        setUploading(false);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = null;
    }
  };

  const handleEditChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // ステータス更新と詳細情報の更新を並行実行
      // put /engineers/{id} に新しいフィールドを含めて送信
      await Promise.all([
        api.put(`/engineers/update-status/${engineerId}`, { status: editData.status }),
        api.put(`/engineers/${engineerId}`, { 
          name: engineer.name,
          status: editData.status,
          skills: editData.skills, 
          memo: editData.memo,
          // 追加フィールド
          unit_price: editData.unit_price,
          nearest_station: editData.nearest_station,
          available_date: editData.available_date,
          contract_type: editData.contract_type
        })
      ]);
      alert('エンジニア情報を更新しました。');
      setIsEditing(false); 
      fetchEngineerDetails(); 
    } catch (error) {
      console.error("エンジニアの更新に失敗しました:", error);
      alert('更新に失敗しました。');
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // 元の値に戻す
    setEditData({
      status: engineer.status,
      skills: engineer.skills || '',
      memo: engineer.memo || '',
      unit_price: engineer.unit_price || '',
      nearest_station: engineer.nearest_station || '',
      available_date: engineer.available_date || '',
      contract_type: engineer.contract_type || ''
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '---';
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  };

  function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
      <div role="tabpanel" hidden={value !== index} {...other}>
        {value === index && (
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  }

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', height: '80vh', alignItems: 'center' }}><CircularProgress /></Box>;
  if (!engineer) return <Typography>エンジニアが見つかりません。</Typography>;

  const hasSkills = engineer.skills && engineer.skills.length > 0;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
      {/* --- ヘッダーエリア --- */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton component={Link} to="/engineers" sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Avatar 
            sx={{ width: 64, height: 64, mr: 2, bgcolor: 'primary.main', fontSize: '1.5rem' }}
          >
            {engineer.name.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              {engineer.name}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" color="text.secondary">エンジニアID: {engineer.id}</Typography>
                {isEditing ? (
                     <FormControl size="small" variant="standard" sx={{ minWidth: 120 }}>
                        <Select
                          value={editData.status}
                          onChange={(e) => handleEditChange('status', e.target.value)}
                        >
                          {['参画中', '営業中', '待機中'].map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                        </Select>
                      </FormControl>
                  ) : (
                    <Chip 
                        label={engineer.status} 
                        color={getStatusColor(engineer.status)} 
                        size="small" 
                        sx={{ fontWeight: 'bold' }}
                    />
                  )}
            </Stack>
          </Box>
        </Box>

        <Box>
           {isEditing ? (
              <Stack direction="row" spacing={2}>
                <Button variant="outlined" onClick={handleCancel}>キャンセル</Button>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave}>変更を保存</Button>
              </Stack>
            ) : (
              <Button variant="contained" startIcon={<EditIcon />} onClick={() => setIsEditing(true)}>
                情報を編集
              </Button>
            )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* --- 左カラム：営業基本情報 --- */}
        <Grid item xs={12} md={4} lg={3}>
            <Card elevation={2} sx={{ mb: 3 }}>
                <CardHeader title="営業基本情報" subheader="Sales Profile" />
                <Divider />
                <CardContent>
                    <List disablePadding>
                        <ListItem>
                            <ListItemIcon><CurrencyYenIcon /></ListItemIcon>
                            <ListItemText 
                                primary="希望単価 / 最低単価" 
                                secondary={
                                    isEditing ? 
                                    <TextField 
                                        variant="standard" 
                                        fullWidth 
                                        placeholder="例: 60万" 
                                        value={editData.unit_price} 
                                        onChange={(e) => handleEditChange('unit_price', e.target.value)}
                                    /> 
                                    : (engineer.unit_price || <Typography color="text.secondary" variant="caption">未設定</Typography>)
                                }
                                secondaryTypographyProps={{ fontWeight: 'bold', color: 'primary.main' }}
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><TrainIcon /></ListItemIcon>
                            <ListItemText 
                                primary="最寄駅" 
                                secondary={
                                    isEditing ? 
                                    <TextField 
                                        variant="standard" 
                                        fullWidth 
                                        placeholder="例: 新宿駅" 
                                        value={editData.nearest_station} 
                                        onChange={(e) => handleEditChange('nearest_station', e.target.value)}
                                    /> 
                                    : (engineer.nearest_station || <Typography color="text.secondary" variant="caption">未設定</Typography>)
                                }
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><CalendarTodayIcon /></ListItemIcon>
                            <ListItemText 
                                primary="稼働開始可能日" 
                                secondary={
                                    isEditing ? 
                                    <TextField 
                                        variant="standard" 
                                        fullWidth 
                                        placeholder="例: 即日" 
                                        value={editData.available_date} 
                                        onChange={(e) => handleEditChange('available_date', e.target.value)}
                                    /> 
                                    : (engineer.available_date || <Typography color="text.secondary" variant="caption">未設定</Typography>)
                                }
                            />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon><WorkIcon /></ListItemIcon>
                            <ListItemText 
                                primary="契約形態" 
                                secondary={
                                    isEditing ? 
                                    <TextField 
                                        variant="standard" 
                                        fullWidth 
                                        placeholder="例: 準委任" 
                                        value={editData.contract_type} 
                                        onChange={(e) => handleEditChange('contract_type', e.target.value)}
                                    /> 
                                    : (engineer.contract_type || <Typography color="text.secondary" variant="caption">未設定</Typography>)
                                }
                            />
                        </ListItem>
                    </List>
                </CardContent>
            </Card>

            <Card elevation={2}>
                <CardHeader 
                    avatar={<SmartToyIcon color="secondary" />}
                    title="AI分析ステータス" 
                />
                <Divider />
                <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        {hasSkills ? (
                            <Alert severity="success" icon={<CheckCircleIcon />}>
                                学習データ登録済み
                            </Alert>
                        ) : (
                            <Alert severity="warning" icon={<ErrorOutlineIcon />}>
                                未学習：検索対象外
                            </Alert>
                        )}
                        <Box>
                            <Typography variant="caption" display="block" color="text.secondary">
                                最終更新: {formatDate(engineer.skills_updated_at)}
                            </Typography>
                             <Typography variant="caption" display="block" color="text.secondary">
                                データ量: {engineer.skills ? `${engineer.skills.length} 文字` : '0'}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Grid>

        {/* --- 右カラム：詳細情報タブ --- */}
        <Grid item xs={12} md={8} lg={9}>
            <Paper elevation={2} sx={{ minHeight: 500 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} aria-label="engineer details tabs">
                        <Tab label="概要・メモ" icon={<PersonIcon />} iconPosition="start" />
                        <Tab label="スキル・経歴" icon={<WorkIcon />} iconPosition="start" />
                        <Tab label="スキルシート管理" icon={<DescriptionIcon />} iconPosition="start" />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <Typography variant="h6" gutterBottom>エンジニアメモ (自由記述)</Typography>
                    {isEditing ? (
                        <TextField
                            multiline
                            rows={12}
                            fullWidth
                            variant="outlined"
                            placeholder="面談の印象、強み、懸念点などを入力..."
                            value={editData.memo}
                            onChange={(e) => handleEditChange('memo', e.target.value)}
                        />
                    ) : (
                        <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, minHeight: 200, whiteSpace: 'pre-wrap' }}>
                            {engineer.memo ? engineer.memo : (
                                <Typography color="text.secondary" fontStyle="italic">
                                    メモは登録されていません。面談ログや特記事項をここに記載してください。
                                </Typography>
                            )}
                        </Box>
                    )}
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Typography variant="h6" gutterBottom>解析済みスキルセット</Typography>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        AIが職務経歴書から自動抽出したスキルキーワードです。マッチング検索に使用されます。
                    </Alert>
                    
                    {isEditing ? (
                        <TextField
                            fullWidth
                            multiline
                            rows={10}
                            label="スキル生データ (編集可能)"
                            value={editData.skills}
                            onChange={(e) => handleEditChange('skills', e.target.value)}
                        />
                    ) : (
                        <Box>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                                {hasSkills ? (
                                    engineer.skills.length < 200 ? (
                                        engineer.skills.split(/[,、\n\s]+/).map((skill, index) => (
                                            skill && <Chip key={index} label={skill} color="primary" variant="outlined" />
                                        ))
                                    ) : (
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {engineer.skills}
                                        </Typography>
                                    )
                                ) : (
                                    <Typography>スキルデータがありません。</Typography>
                                )}
                            </Box>
                        </Box>
                    )}
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center', py: 4 }}>
                        <CloudUploadIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>スキルシートの更新</Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                            最新のPDF職務経歴書をアップロードしてください。<br/>
                            AIが内容を解析し、スキル情報と検索用ベクトルを自動更新します。
                        </Typography>

                        {uploadResult && (
                            <Alert severity={uploadResult.success ? "success" : "error"} sx={{ my: 2, textAlign: 'left' }}>
                                {uploadResult.message}
                            </Alert>
                        )}

                        <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <input
                                accept="application/pdf"
                                style={{ display: 'none' }}
                                id="raised-button-file"
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            <label htmlFor="raised-button-file">
                                <Button variant="outlined" component="span" size="large">
                                    {selectedFile ? selectedFile.name : "PDFファイルを選択"}
                                </Button>
                            </label>
                            
                            <Button 
                                variant="contained" 
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                sx={{ minWidth: 200 }}
                            >
                                {uploading ? <CircularProgress size={24} color="inherit" /> : "アップロード & 解析開始"}
                            </Button>
                        </Box>
                    </Box>
                </TabPanel>
            </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default EngineerDetailPage;