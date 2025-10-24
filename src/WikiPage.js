import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Container, Typography, Box, Paper, CircularProgress } from '@mui/material';

function WikiPage() {
  const { pageId } = useParams(); // URLからページのIDを取得
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://backend-api-1060579851059.asia-northeast1.run.app'; // ★重要★ あなたのバックエンドURL

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_URL}/pages/${pageId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPage(response.data);
      } catch (error) {
        console.error("ページの取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [pageId]); // pageIdが変わるたびにデータを再取得

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}><CircularProgress /></Box>;
  }

  if (!page) {
    return <Typography>ページが見つかりません。</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {page.title}
        </Typography>
        <Paper sx={{ p: 3 }}>
          <ReactMarkdown>
            {page.content}
          </ReactMarkdown>
        </Paper>
      </Box>
    </Container>
  );
}

export default WikiPage;