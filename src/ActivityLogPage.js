// src/ActivityLogPage.js (新規作成)

import React, { useEffect, useState } from 'react';
import { 
    Container, Typography, Paper, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, 
    CircularProgress, Alert, TablePagination, Box 
} from '@mui/material';
import { getActivityLogs } from './api'; // 先ほど追加した関数

const ActivityLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                setLoading(true);
                const data = await getActivityLogs();
                setLogs(data);
                setError(null);
            } catch (err) {
                setError('活動履歴の取得に失敗しました。管理者権限があるか確認してください。');
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, []);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const formatTimestamp = (ts) => {
        return new Date(ts).toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    if (loading) {
        return <Container><CircularProgress /></Container>;
    }

    if (error) {
        return <Container><Alert severity="error">{error}</Alert></Container>;
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" gutterBottom>
                営業活動履歴
            </Typography>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 700 }}>
                    <Table stickyHeader aria-label="活動履歴テーブル">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>日時</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>ユーザー</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>操作</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>対象</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>詳細</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {logs
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((log) => (
                                    <TableRow hover key={log.id}>
                                        <TableCell>
                                            {formatTimestamp(log.timestamp)}
                                        </TableCell>
                                        <TableCell>
                                            {/* ユーザーが削除されても '不明' と表示 */}
                                            {log.user ? log.user.name : '(不明なユーザー)'}
                                        </TableCell>
                                        <TableCell>
                                            <Box 
                                              component="span" 
                                              sx={{
                                                fontWeight: 'bold',
                                                fontSize: '0.8rem',
                                                color: log.action.includes('DELETE') ? 'error.main' : (log.action.includes('CREATE') ? 'success.main' : 'text.secondary')
                                              }}
                                            >
                                              {log.action}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {log.entity_type} (ID: {log.entity_id})
                                        </TableCell>
                                        <TableCell>
                                            {log.details}
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={logs.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="表示件数:"
                />
            </Paper>
        </Container>
    );
};

export default ActivityLogPage;