import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from './api';
import {
  Container, Typography, Box, Paper, CircularProgress, List,
  ListItem, ListItemText, ListItemButton, Divider
} from '@mui/material';

function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('q'); // URLから検索キーワードを取得
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!keyword) {
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/pages/search/?keyword=${keyword}`);
        setResults(response.data);
      } catch (error) {
        console.error("検索結果の取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [keyword]); // keywordが変わるたびに再検索

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          検索結果: "{keyword}"
        </Typography>

        {results.length > 0 ? (
          <Paper>
            <List>
              {results.map((page, index) => (
                <React.Fragment key={page.id}>
                  <ListItem disablePadding>
                    <ListItemButton component={Link} to={`/pages/${page.id}`}>
                      <ListItemText
                        primary={page.title}
                        secondary={`更新日: ${new Date(page.updated_at).toLocaleDateString()} | 作成者: ${page.author ? page.author.name : '不明'}`}
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < results.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        ) : (
          <Typography>検索結果は見つかりませんでした。</Typography>
        )}
      </Box>
    </Container>
  );
}

export default SearchResultsPage;