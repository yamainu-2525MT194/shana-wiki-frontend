// shana-wiki-frontend/src/aiApi.js

import axios from 'axios';

// ★★★ 設定をローカル開発優先に戻します ★★★
// Reactのローカル開発(npm start)時は true になります
const isDevelopment = process.env.NODE_ENV === 'development';

// 開発中は localhost, 本番ビルド時は Cloud Run を自動で切り替え
const AI_API_URL = isDevelopment 
  ? 'http://localhost:8001' 
  : 'https://shana-ai-chat-v2-1060579851059.asia-northeast1.run.app';

const aiApi = axios.create({
  baseURL: AI_API_URL,
});

// リクエストインターセプター: トークンを自動付与
aiApi.interceptors.request.use(
  (config) => {
    // トークンキー名は login 処理の実装に合わせて 'accessToken' か 'token' か確認してください
    // ここでは念のため両方チェックするように書いておきます
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
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
      // 認証エラー時は強制ログアウト処理
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
      window.location.href = '/';
      // ユーザー体験を損なわないよう、alertは必要な場合のみ推奨
      // alert('セッションの有効期限が切れました。再度ログインしてください。');
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
      title: "New Chat", 
      context: ""        
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
    const response = await aiApi.get(`/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('セッション情報の取得に失敗しました:', error.response || error);
    throw error;
  }
};

/**
 * 特定の案件にマッチするエンジニアを取得
 * @param {string} opportunityId - 案件ID
 * @returns {Promise<Array>} マッチングしたエンジニアのリスト
 */
export const getMatchingEngineers = async (opportunityId) => {
  try {
    const response = await aiApi.get(`/match/opportunities/${opportunityId}`);
    return response.data.matches;
  } catch (error) {
    console.error('マッチングエンジニアの取得に失敗しました:', error.response || error);
    throw error;
  }
};

/**
 * 案件テキストのAI分析を実行
 * @param {string} rawText - 分析したいテキスト
 * @returns {Promise<Object>} 分析結果JSON
 */
export const analyzeOpportunity = async (rawText) => {
  try {
    // ★修正箇所: fetchではなく aiApi(axios) を使用
    // これにより URL(baseURL) と Auth Header が自動解決されます
    const response = await aiApi.post('/analyze/opportunity', {
      raw_text: rawText
    });
    return response.data;
  } catch (error) {
    console.error('AI Analysis Error:', error.response || error);
    // エラーの詳細を投げる
    const errorMessage = error.response?.data?.detail || '分析に失敗しました';
    throw new Error(errorMessage);
  }
};

export default aiApi;