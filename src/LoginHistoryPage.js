// src/LoginHistoryPage.js (新規作成)

import React, { useEffect, useState } from 'react';
import { 
    Container, Typography, Paper, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, 
    CircularProgress, Alert, TablePagination 
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { getLoginHistory } from './api'; // 先ほど追加した関数

const LoginHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                setLoading(true);
                const data = await getLoginHistory();
                setHistory(data);
                setError(null);
            } catch (err) {
                setError('履歴の取得に失敗しました。管理者権限があるか確認してください。');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
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
                ログイン履歴
            </Typography>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 700 }}>
                    <Table stickyHeader aria-label="ログイン履歴テーブル">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>日時</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>結果</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>IPアドレス</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {history
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row) => (
                                    <TableRow hover key={row.id}>
                                        <TableCell>
                                            {formatTimestamp(row.timestamp)}
                                        </TableCell>
                                        <TableCell>{row.email}</TableCell>
                                        <TableCell>
                                            {row.success ? (
                                                <CheckCircleIcon color="success" fontSize="small" />
                                            ) : (
                                                <CancelIcon color="error" fontSize="small" />
                                            )}
                                        </TableCell>
                                        <TableCell>{row.ip_address}</TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10, 25, 100]}
                    component="div"
                    count={history.length}
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

export default LoginHistoryPage;