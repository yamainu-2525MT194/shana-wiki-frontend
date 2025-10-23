import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, Box, Paper, CircularProgress } from '@mui/material';

function WikiPage() {
  const { pageId } = useParams(); // Get the page ID from the URL
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = 'https://backend-api-1060579851059.asia-northeast1.run.app'; // ★ Set your backend URL

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_URL}/pages/${pageId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPage(response.data);
      } catch (error) {
        console.error("Failed to fetch page:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPage();
  }, [pageId]);

  if (loading) {
    return <CircularProgress />;
  }

  if (!page) {
    return <Typography>Page not found.</Typography>;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {page.title}
        </Typography>
        <Paper sx={{ p: 3 }}>
          {/* This will render the content as plain text for now */}
          <Typography sx={{ whiteSpace: 'pre-wrap' }}>{page.content}</Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default WikiPage;