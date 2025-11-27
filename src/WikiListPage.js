import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPages } from './api';
import {
  Container, Typography, Box, Paper, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, TablePagination, Stack
} from '@mui/material';
import ArticleIcon from '@mui/icons-material/Article';
import AddIcon from '@mui/icons-material/Add';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const WikiListPage = () => {
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  // ★★★ 修正: fetchPages を useEffect の中に移動 ★★★
  useEffect(() => {
    const fetchPages = async () => {
      setLoading(true);
      try {
        // BackendのページネーションAPIを呼び出す
        // skip = 現在のページ番号 × 1ページあたりの件数
        const data = await getPages(page * rowsPerPage, rowsPerPage);
        setPages(data.pages);
        setTotalCount(data.total);
      } catch (error) {
        console.error("Wiki一覧の取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPages();
  }, [page, rowsPerPage]); // 依存配列はこれでOKになります

  // ページ切り替え
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // 表示件数変更
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0); // 1ページ目に戻す
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ArticleIcon fontSize="large" color="primary" />
          社内Wiki一覧
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          component={Link} 
          to="/pages/create" 
        >
          新規ページ作成
        </Button>
      </Box>

      <Paper sx={{ width: '100%', mb: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell>タイトル</TableCell>
                    <TableCell>作成者</TableCell>
                    <TableCell>作成日</TableCell>
                    <TableCell align="center">アクション</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pages.length > 0 ? (
                    pages.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell component="th" scope="row">
                          <Link to={`/pages/${row.id}`} style={{ textDecoration: 'none', fontWeight: 'bold', color: '#1976d2' }}>
                            {row.title}
                          </Link>
                        </TableCell>
                        <TableCell>
                          {row.author ? row.author.name : '不明'}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={0.5} color="text.secondary">
                            <AccessTimeIcon fontSize="small" />
                            <Typography variant="body2">
                              {new Date(row.created_at).toLocaleDateString()}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <Button 
                            variant="outlined" 
                            size="small" 
                            onClick={() => navigate(`/pages/${row.id}`)}
                          >
                            詳細
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        Wikiページがまだありません。
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="表示件数:"
              rowsPerPageOptions={[5, 10, 25]}
            />
          </>
        )}
      </Paper>
    </Container>
  );
};

export default WikiListPage;