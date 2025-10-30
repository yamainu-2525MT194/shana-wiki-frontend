import React, { useState, useEffect } from 'react';
import api from './api';
import {
  Container, Typography, Box, Paper, CircularProgress, List,
  ListItem, ListItemText, Divider, Accordion, AccordionSummary,
  AccordionDetails, Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

function EngineerStatusPage() {
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEngineers = async () => {
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
    fetchEngineers();
  }, []);

  // ステータスに応じてChipの色を返す関数
  const getStatusChipColor = (status) => {
    switch (status) {
      case '参画中':
        return 'success';
      case '営業中':
        return 'warning';
      case '待機中':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          エンジニア状況管理
        </Typography>

        {engineers.length > 0 ? (
          engineers.map((engineer) => (
            <Accordion key={engineer.id}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${engineer.id}-content`}
                id={`panel-${engineer.id}-header`}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Typography sx={{ flexGrow: 1 }}>{engineer.name}</Typography>
                  <Chip label={engineer.status} color={getStatusChipColor(engineer.status)} />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="h6">進行中の案件</Typography>
                {engineer.opportunities && engineer.opportunities.length > 0 ? (
                  <List>
                    {engineer.opportunities.map((opp, index) => (
                      <React.Fragment key={opp.id}>
                        <ListItem>
                          <ListItemText
                            primary={opp.company_name}
                            secondary={`ステータス: ${opp.status}`}
                          />
                        </ListItem>
                        {index < engineer.opportunities.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                  </List>
                ) : (
                  <Typography>現在進行中の案件はありません。</Typography>
                )}
              </AccordionDetails>
            </Accordion>
          ))
        ) : (
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography>登録されているエンジニアがいません。</Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
}

export default EngineerStatusPage;