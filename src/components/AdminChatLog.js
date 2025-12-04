// shana-wiki-frontend/src/components/AdminChatLog.js (新規作成推奨)
import React, { useEffect, useState } from 'react';
import { getAdminChatSessions, getAdminSessionMessages } from '../api';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableHead, TableRow, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, Chip 
} from '@mui/material';

const AdminChatLog = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null); // 詳細表示用
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const data = await getAdminChatSessions();
      setSessions(data);
    } catch (error) {
      console.error("ログ取得エラー", error);
    }
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

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>🤖 AIチャット監査ログ</Typography>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>日時</TableCell>
              <TableCell>ユーザー</TableCell>
              <TableCell>タイトル</TableCell>
              <TableCell>ラリー数</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((sess) => (
              <TableRow key={sess.id}>
                <TableCell>{new Date(sess.updated_at).toLocaleString()}</TableCell>
                <TableCell>{sess.user_name} <br/><span style={{fontSize: '0.8em', color: 'gray'}}>{sess.user_email}</span></TableCell>
                <TableCell>{sess.title}</TableCell>
                <TableCell>{sess.message_count}</TableCell>
                <TableCell>
                  <Button variant="outlined" size="small" onClick={() => handleOpenDetail(sess)}>詳細</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* 詳細ダイアログ */}
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
                {msg.role === 'user' ? '👤 営業担当' : '🤖 AI'} - {new Date(msg.created_at).toLocaleString()}
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