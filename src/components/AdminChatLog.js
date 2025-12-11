import React, { useEffect, useState } from 'react';
import { getAdminChatSessions, getAdminSessionMessages, deleteChatSessions } from '../api';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, 
  TableHead, TableRow, Button, Dialog, DialogTitle, 
  DialogContent, DialogActions, TableSortLabel, Checkbox,
  IconButton, Tooltip, Toolbar, alpha, Link 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

// ★ Markdown用ライブラリを追加
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AdminChatLog = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);
  
  const [orderBy, setOrderBy] = useState('updated_at');
  const [order, setOrder] = useState('desc');
  const [selected, setSelected] = useState([]); 

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderBy, order]);

  const loadSessions = async () => {
    try {
      const data = await getAdminChatSessions(0, 50, orderBy, order);
      setSessions(data);
      setSelected([]);
    } catch (error) {
      console.error("ログ取得エラー", error);
    }
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = sessions.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const handleDelete = async () => {
    if (!window.confirm(`${selected.length}件のログを削除してもよろしいですか？`)) return;

    try {
      await deleteChatSessions(selected);
      alert('削除しました');
      loadSessions();
    } catch (error) {
      console.error("削除エラー", error);
      alert("削除に失敗しました");
    }
  };

  const handleOpenDetail = async (e, session) => {
    e.stopPropagation();
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

  const formatDate = (dateString) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    if (date.getFullYear() < 2024) return "---"; 
    return date.toLocaleString();
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  // ★ Markdownのスタイル定義 (ChatPageと同じもの)
  const markdownComponents = {
    p: ({node, ...props}) => <Typography variant="body1" sx={{ mb: 1, '&:last-child': { mb: 0 } }} {...props} />,
    h1: ({node, ...props}) => <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }} {...props} />,
    h2: ({node, ...props}) => <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }} {...props} />,
    h3: ({node, ...props}) => <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5, fontWeight: 'bold' }} {...props} />,
    ul: ({node, ...props}) => <Box component="ul" sx={{ pl: 2, my: 1 }} {...props} />,
    ol: ({node, ...props}) => <Box component="ol" sx={{ pl: 2, my: 1 }} {...props} />,
    li: ({node, ...props}) => <li style={{ marginBottom: '4px' }} {...props} />,
    a: ({node, ...props}) => <Link target="_blank" rel="noopener" {...props} />,
    code: ({node, inline, className, children, ...props}) => {
      return inline ? (
        <code style={{ backgroundColor: 'rgba(0,0,0,0.1)', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace' }} {...props}>
          {children}
        </code>
      ) : (
        <Box component="pre" sx={{ backgroundColor: '#2d2d2d', color: '#fff', p: 1.5, borderRadius: 1, overflowX: 'auto', my: 1 }}>
          <code {...props}>{children}</code>
        </Box>
      );
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          ...(selected.length > 0 && {
            bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
          }),
        }}
      >
        {selected.length > 0 ? (
          <Typography sx={{ flex: '1 1 100%' }} color="inherit" variant="subtitle1" component="div">
            {selected.length} 件選択中
          </Typography>
        ) : (
          <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
            🤖 AIチャット監査ログ
          </Typography>
        )}

        {selected.length > 0 && (
          <Tooltip title="削除">
            <IconButton onClick={handleDelete}>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </Toolbar>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  color="primary"
                  indeterminate={selected.length > 0 && selected.length < sessions.length}
                  checked={sessions.length > 0 && selected.length === sessions.length}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              
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
            {sessions.map((sess) => {
              const isItemSelected = isSelected(sess.id);
              return (
                <TableRow 
                  key={sess.id}
                  hover
                  onClick={(event) => handleClick(event, sess.id)}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  selected={isItemSelected}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={isItemSelected}
                    />
                  </TableCell>

                  <TableCell>{formatDate(sess.updated_at || sess.created_at)}</TableCell>
                  
                  <TableCell>
                    {sess.user_name} 
                    <br/>
                    <span style={{fontSize: '0.8em', color: 'gray'}}>{sess.user_email}</span>
                  </TableCell>
                  <TableCell>{sess.title}</TableCell>
                  <TableCell>{sess.message_count}</TableCell>
                  <TableCell>
                    <Button 
                      variant="outlined" 
                      size="small" 
                      onClick={(e) => handleOpenDetail(e, sess)}
                    >
                      詳細
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {sessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">ログがありません</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>会話詳細: {selectedSession?.user_name}</DialogTitle>
        <DialogContent dividers>
          {messages.map((msg, idx) => (
            <Box key={idx} sx={{ 
              mb: 2, 
              p: 2, 
              bgcolor: msg.role === 'user' ? '#e3f2fd' : '#f5f5f5',
              borderRadius: 2,
              '& ul, & ol': { pl: 3 },
              '& a': { color: '#1976d2' }
            }}>
              <Typography variant="caption" display="block" color="textSecondary">
                {msg.role === 'user' ? '👤 営業担当' : '🤖 AI'} - {formatDate(msg.created_at)}
              </Typography>
              
              {/* ★ ここでReactMarkdownを使ってレンダリングします */}
              <Box>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {msg.content}
                </ReactMarkdown>
              </Box>
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