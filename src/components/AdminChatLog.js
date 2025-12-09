// shana-wiki-frontend/src/components/AdminChatLog.js

import React, { useEffect, useState } from 'react';
import { getAdminChatSessions, getAdminSessionMessages } from '../api'; // 相対パスを確認してください
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableHead, TableRow, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, TableSortLabel 
} from '@mui/material';

const AdminChatLog = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);

  // ソート用ステート
  const [orderBy, setOrderBy] = useState('updated_at');
  const [order, setOrder] = useState('desc');

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderBy, order]); // ソート条件が変わったら再ロード

  const loadSessions = async () => {
    try {
      const data = await getAdminChatSessions(0, 50, orderBy, order);
      setSessions(data);
    } catch (error) {
      console.error("ログ取得エラー", error);
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleOpenDetail = async (session) => {
    setSelectedSession(session);
    setOpen(true);
    try {
      const msgs = await getAdminSessionMessages(session.id);
      setMessages(msgs);
    } catch (error) {
      console.error("メッセージ取得エラー", error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setMessages([]);
  };

  // ★ 1970年問題を解決する日付フォーマッター
  const formatDate = (dateString) => {
    if (!dateString) return "---"; // データがない場合
    const date = new Date(dateString);
    // 1970年 (Unix Epoch付近) だったら無効扱いにする
    if (date.getFullYear() < 2024) return "---"; 
    return date.toLocaleString();
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>🤖 AIチャット監査ログ</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'updated_at'}
                  direction={orderBy === 'updated_at' ? order : 'asc'}
                  onClick={() => handleRequestSort('updated_at')}
                >
                  更新日時
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'user_name'}
                  direction={orderBy === 'user_name' ? order : 'asc'}
                  onClick={() => handleRequestSort('user_name')}
                >
                  ユーザー
                </TableSortLabel>
              </TableCell>
              <TableCell>タイトル</TableCell>
              <TableCell>ラリー数</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((sess) => (
              <TableRow key={sess.id}>
                {/* ★ここで安全な日付変換を使用 */}
                <TableCell>{formatDate(sess.updated_at || sess.created_at)}</TableCell>
                
                <TableCell>
                  {sess.user_name} 
                  <br/>
                  <span style={{fontSize: '0.8em', color: 'gray'}}>{sess.user_email}</span>
                </TableCell>
                <TableCell>{sess.title}</TableCell>
                <TableCell>{sess.message_count}</TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => handleOpenDetail(sess)}>詳細</Button>
                </TableCell>
              </TableRow>
            ))}
            {sessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">ログがありません</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* 詳細ダイアログ (変更なし) */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>会話詳細: {selectedSession?.user_name}</DialogTitle>
        <DialogContent dividers>
          {messages.map((msg, idx) => (
            <Box key={idx} sx={{ 
              mb: 2, 
              p: 2, 
              bgcolor: msg.role === 'user' ? '#e3f2fd' : '#f5f5f5',
              borderRadius: 2
            }}>
              <Typography variant="caption" display="block" color="textSecondary">
                {msg.role === 'user' ? '👤 営業担当' : '🤖 AI'} - {formatDate(msg.created_at)}
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {msg.content}
              </Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminChatLog;