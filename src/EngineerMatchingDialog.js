import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, List, ListItem, ListItemText, ListItemAvatar,
  Avatar, Typography, Chip, Box, CircularProgress, Alert, Divider
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { getMatchingEngineers } from './aiApi'; 

const EngineerMatchingDialog = ({ open, onClose, opportunity }) => {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ★★★ 修正箇所: fetchMatchesの定義を useEffect の中に移動しました ★★★
  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      setError('');
      try {
        // AI APIを呼び出し
        const matches = await getMatchingEngineers(opportunity.id);
        setEngineers(matches);
      } catch (err) {
        console.error(err);
        setError('マッチング処理に失敗しました。AIサーバーが起動しているか確認してください。');
      } finally {
        setLoading(false);
      }
    };

    if (open && opportunity && opportunity.id) {
      fetchMatches();
    }
    // 関数を中に移動したので、依存配列は [open, opportunity] だけでOKになります
  }, [open, opportunity]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#f0f7ff' }}>
        <AutoAwesomeIcon color="primary" />
        AIマッチング提案
        <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
           案件: {opportunity?.notes?.substring(0, 30)}...
        </Typography>
      </DialogTitle>
      
      <DialogContent dividers>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
            <Box sx={{ ml: 2 }}>AIが最適なエンジニアを探しています...</Box>
          </Box>
        )}

        {error && <Alert severity="error">{error}</Alert>}

        {!loading && !error && engineers.length === 0 && (
          <Typography align="center" sx={{ p: 2 }}>
            マッチするエンジニアが見つかりませんでした。
          </Typography>
        )}

        <List>
          {engineers.map((eng, index) => (
            <React.Fragment key={eng.id}>
              <ListItem alignItems="flex-start">
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: index === 0 ? 'primary.main' : 'grey.400' }}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="h6" component="span">
                        {eng.name}
                      </Typography>
                      <Chip 
                        label={eng.status} 
                        color={eng.status === '稼働可能' ? 'success' : 'default'} 
                        size="small" 
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.primary" gutterBottom>
                        {eng.skills}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AutoAwesomeIcon fontSize="inherit" />
                        AI推奨: {eng.match_reason}
                      </Typography>
                    </Box>
                  }
                />
                <Button variant="outlined" size="small" sx={{ ml: 2, mt: 1 }}>
                  詳細確認
                </Button>
              </ListItem>
              <Divider variant="inset" component="li" />
            </React.Fragment>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EngineerMatchingDialog;