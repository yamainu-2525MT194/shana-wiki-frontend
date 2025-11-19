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
  Switch
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import { createChatSession, sendChatMessage, getSession } from './aiApi';

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
        // 1. ローカルストレージから前回のセッションIDを探す
        const storedSessionId = localStorage.getItem('chatSessionId');
        
        if (storedSessionId) {
          try {
            // 2. 既存セッションの履歴を取得してみる
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
            console.warn('既存セッションの復元に失敗しました（期限切れ等の可能性）。新規作成します。');
            // 復元失敗したらIDを消して新規作成へ進む
            localStorage.removeItem('chatSessionId');
          }
        }

        // 3. 新規セッション作成
        const session = await createChatSession();
        setSessionId(session.id);
        localStorage.setItem('chatSessionId', session.id); // IDを保存
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

  // 新しいセッションを強制的に開始
  const handleNewSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const session = await createChatSession();
      setSessionId(session.id);
      setMessages([]);
      // 新しいIDを保存
      localStorage.setItem('chatSessionId', session.id);
      console.log('新しいセッションを開始:', session.id);
    } catch (err) {
      console.error('セッション作成エラー:', err);
      setError('新しいセッションの作成に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  // メッセージ送信
  const handleSend = async () => {
    if (!inputMessage.trim() || !sessionId || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);

    // ユーザーメッセージを即座に表示
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      setIsLoading(true);

      // AI応答を取得 (RAG機能のON/OFFを反映)
      const response = await sendChatMessage(sessionId, userMessage, useRag);

      // AIメッセージを追加
      const aiMessage = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      console.error('メッセージ送信エラー:', err);
      setError('メッセージの送信に失敗しました。もう一度お試しください。');
      
      // エラーの場合、ユーザーメッセージを削除
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  // Enterキーで送信
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 初期化中
  if (isInitializing) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '80vh' 
      }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>チャットを準備中...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', p: 3 }}>
      {/* ヘッダー */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            🤖 AIチャット
          </Typography>
          
          {/* RAG切り替えスイッチ */}
          <Paper elevation={0} sx={{ bgcolor: '#f5f5f5', px: 2, py: 0.5, borderRadius: 4, border: '1px solid #e0e0e0' }}>
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
          </Paper>
        </Box>

        <Tooltip title="新しいチャットを開始 (履歴をクリア)">
          <IconButton 
            onClick={handleNewSession} 
            disabled={isLoading}
            color="primary"
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* エラー表示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* チャット履歴エリア */}
      <Paper 
        elevation={3} 
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          mb: 2, 
          overflowY: 'auto',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {messages.length === 0 && !isLoading && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: '100%',
            color: 'text.secondary'
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
              display: 'flex', 
              mb: 2,
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
                borderRadius: 2
              }}
            >
              <Typography 
                variant="body1" 
                sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
              >
                {msg.content}
              </Typography>
            </Paper>

            {msg.role === 'user' && (
              <Avatar sx={{ bgcolor: '#4caf50', ml: 2 }}>
                <PersonIcon />
              </Avatar>
            )}
          </Box>
        ))}

        {/* ローディング表示 */}
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

      {/* 入力エリア */}
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

      {/* セッションID表示 (デバッグ用) */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'right' }}>
        セッションID: {sessionId || '未作成'}
      </Typography>
    </Box>
  );
}

export default ChatPage;