import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
  FormControlLabel,
  Switch,
  Link
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { createChatSession, sendChatMessage, getSession } from './aiApi';

// ★ Markdown用ライブラリのインポート
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function ChatPage() {
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // RAG機能の切り替えスイッチ (デフォルトON)
  const [useRag, setUseRag] = useState(true);
  
  const messagesEndRef = useRef(null);

  // 自動スクロール
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 初期化: セッション復元または新規作成
  useEffect(() => {
    const initSession = async () => {
      setIsInitializing(true);
      setError(null);
      
      try {
        const storedSessionId = localStorage.getItem('chatSessionId');
        
        if (storedSessionId) {
          try {
            console.log('既存セッションを復元中:', storedSessionId);
            const sessionData = await getSession(storedSessionId);
            
            if (sessionData && sessionData.id) {
              setSessionId(sessionData.id);
              setMessages(sessionData.messages || []);
              console.log('セッション復元成功');
              setIsInitializing(false);
              return;
            }
          } catch (err) {
            console.warn('既存セッションの復元に失敗しました。新規作成します。');
            localStorage.removeItem('chatSessionId');
          }
        }

        const session = await createChatSession();
        setSessionId(session.id);
        localStorage.setItem('chatSessionId', session.id);
        setMessages([]);
        console.log('新規セッション作成成功:', session.id);

      } catch (err) {
        console.error('セッション初期化エラー:', err);
        setError('チャットの初期化に失敗しました。ページを再読み込みしてください。');
      } finally {
        setIsInitializing(false);
      }
    };

    initSession();
  }, []);

  const handleNewSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const session = await createChatSession();
      setSessionId(session.id);
      setMessages([]);
      localStorage.setItem('chatSessionId', session.id);
      console.log('新しいセッションを開始:', session.id);
    } catch (err) {
      console.error('セッション作成エラー:', err);
      setError('新しいセッションの作成に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() || !sessionId || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);

    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      setIsLoading(true);
      const response = await sendChatMessage(sessionId, userMessage, useRag);

      const aiMessage = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      console.error('メッセージ送信エラー:', err);
      setError('メッセージの送信に失敗しました。もう一度お試しください。');
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isInitializing) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>チャットを準備中...</Typography>
      </Box>
    );
  }

  // ★ Markdownのスタイル定義 (MUIコンポーネントへのマッピング)
  const markdownComponents = {
    // 段落
    p: ({node, ...props}) => <Typography variant="body1" sx={{ mb: 1, '&:last-child': { mb: 0 } }} {...props} />,
    // 見出し (チャット内なので少し小さめに調整)
    h1: ({node, ...props}) => <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }} {...props} />,
    h2: ({node, ...props}) => <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, fontWeight: 'bold' }} {...props} />,
    h3: ({node, ...props}) => <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5, fontWeight: 'bold' }} {...props} />,
    // リスト
    ul: ({node, ...props}) => <Box component="ul" sx={{ pl: 2, my: 1 }} {...props} />,
    ol: ({node, ...props}) => <Box component="ol" sx={{ pl: 2, my: 1 }} {...props} />,
    li: ({node, ...props}) => <li style={{ marginBottom: '4px' }} {...props} />,
    // リンク
    a: ({node, ...props}) => <Link target="_blank" rel="noopener" {...props} />,
    // コードブロック (簡易的)
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
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', p: 3 }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            🤖 AIチャット
          </Typography>
          
          <Paper elevation={0} sx={{ bgcolor: '#f5f5f5', px: 2, py: 0.5, borderRadius: 4, border: '1px solid #e0e0e0' }}>
            {/* ★ Tooltipで囲むことで、マウスホバー時に説明を表示します */}
            <Tooltip 
              title={
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" display="block">ON: 社内データを検索して回答 (精度重視)</Typography>
                  <Typography variant="caption" display="block">OFF: 一般知識のみで回答 (速度重視)</Typography>
                </Box>
              } 
              arrow 
              placement="bottom"
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={useRag}
                    onChange={(e) => setUseRag(e.target.checked)}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}>
                    <LibraryBooksIcon sx={{ fontSize: 18, mr: 0.5, color: useRag ? 'primary.main' : 'text.disabled' }} />
                    Wiki検索
                  </Box>
                }
              />
            </Tooltip>
          </Paper>
        </Box>

        <Tooltip title="新しいチャットを開始 (履歴をクリア)">
          <IconButton onClick={handleNewSession} disabled={isLoading} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* チャット履歴エリア */}
      <Paper 
        elevation={3} 
        sx={{ 
          flexGrow: 1, p: 3, mb: 2, overflowY: 'auto',
          backgroundColor: '#f5f5f5', display: 'flex', flexDirection: 'column'
        }}
      >
        {messages.length === 0 && !isLoading && (
          <Box sx={{ 
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            height: '100%', color: 'text.secondary'
          }}>
            <SmartToyIcon sx={{ fontSize: 64, mb: 2, opacity: 0.5 }} />
            <Typography variant="h6">チャットを開始しましょう</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              社内Wikiの内容について質問できます
            </Typography>
          </Box>
        )}

        {messages.map((msg, index) => (
          <Box 
            key={index} 
            sx={{ 
              display: 'flex', mb: 2,
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            {msg.role === 'assistant' && (
              <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
                <SmartToyIcon />
              </Avatar>
            )}
            
            <Paper 
              elevation={1}
              sx={{ 
                p: 2, 
                maxWidth: '70%',
                backgroundColor: msg.role === 'user' ? '#e3f2fd' : '#fff',
                borderRadius: 2,
                // ★ Markdown内の要素に対するデフォルトスタイル
                '& ul, & ol': { pl: 3 },
                '& a': { color: '#1976d2' }
              }}
            >
              {msg.role === 'assistant' ? (
                // AIの回答はMarkdownとしてレンダリング
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                // ユーザーの入力はそのまま表示
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {msg.content}
                </Typography>
              )}
            </Paper>

            {msg.role === 'user' && (
              <Avatar sx={{ bgcolor: '#4caf50', ml: 2 }}>
                <PersonIcon />
              </Avatar>
            )}
          </Box>
        ))}

        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: '#1976d2', mr: 2 }}>
              <SmartToyIcon />
            </Avatar>
            <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2" component="span" color="text.secondary">
                {useRag ? 'Wikiを検索して回答を作成中...' : 'AIが考え中...'}
              </Typography>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Paper>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="メッセージを入力... (Shift+Enterで改行、Enterで送信)"
          disabled={isLoading || !sessionId}
          variant="outlined"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          disabled={!inputMessage.trim() || isLoading || !sessionId}
          endIcon={<SendIcon />}
          sx={{ minWidth: 100 }}
        >
          送信
        </Button>
      </Box>
      
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'right' }}>
        セッションID: {sessionId || '未作成'}
      </Typography>
    </Box>
  );
}

export default ChatPage;