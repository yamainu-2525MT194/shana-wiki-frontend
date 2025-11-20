import axios from 'axios';

// AI Chatサーバー用のAPIクライアント
const isDevelopment = process.env.NODE_ENV === 'development';

const AI_API_URL = isDevelopment 
  ? 'http://localhost:8001' // 開発環境: ローカルのAI Chatサーバー
  : 'https://shana-ai-chat-v2-run-app.a.run.app'; 

const aiApi = axios.create({
  baseURL: AI_API_URL,
});

// リクエストインターセプター: トークンを自動付与
aiApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター: 401エラーでログアウト
aiApi.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/';
      alert('セッションの有効期限が切れました。再度ログインしてください。');
    }
    return Promise.reject(error);
  }
);

/**
 * 新しいチャットセッションを作成
 * @returns {Promise<Object>} セッション情報 { id, user_id, created_at }
 */
export const createChatSession = async () => {
  try {
    const response = await aiApi.post('/sessions', {
      title: null,
      context: null
    });
    return response.data;
  } catch (error) {
    console.error('チャットセッションの作成に失敗しました:', error.response || error);
    throw error;
  }
};

/**
 * ユーザーのチャットセッション一覧を取得
 * @returns {Promise<Array>} セッション一覧
 */
export const getChatSessions = async () => {
  try {
    const response = await aiApi.get('/sessions');
    return response.data;
  } catch (error) {
    console.error('セッション一覧の取得に失敗しました:', error.response || error);
    throw error;
  }
};

/**
 * チャットメッセージを送信してAIの応答を取得
 * @param {string} sessionId - セッションID
 * @param {string} message - ユーザーのメッセージ
 * @param {boolean} useRag - RAG機能を使用するか (デフォルト: false)
 * @returns {Promise<Object>} AI応答 { response, session_id }
 */
export const sendChatMessage = async (sessionId, message, useRag = false) => {
  try {
    const response = await aiApi.post('/chat', {
      session_id: sessionId,
      message: message,
      use_rag: useRag
    });
    return response.data;
  } catch (error) {
    console.error('チャットメッセージの送信に失敗しました:', error.response || error);
    throw error;
  }
};

/**
 * 特定のセッションの詳細とメッセージ履歴を取得
 * @param {string} sessionId - セッションID
 * @returns {Promise<Object>} セッション詳細（messages配列を含む）
 */
export const getSession = async (sessionId) => {
  try {
    // サーバー側のエンドポイントは /sessions/{session_id} で履歴も返します
    const response = await aiApi.get(`/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('セッション情報の取得に失敗しました:', error.response || error);
    throw error;
  }
};

export default aiApi;

/**
 * 特定の案件にマッチするエンジニアを取得
 * @param {string} opportunityId - 案件ID
 * @returns {Promise<Array>} マッチングしたエンジニアのリスト
 */
export const getMatchingEngineers = async (opportunityId) => {
  try {
    // AI Chatサーバーの新しいエンドポイントを呼び出す
    const response = await aiApi.get(`/match/opportunities/${opportunityId}`);
    return response.data.matches;
  } catch (error) {
    console.error('マッチングエンジニアの取得に失敗しました:', error.response || error);
    throw error;
  }
};