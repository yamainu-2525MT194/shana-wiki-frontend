// shana-wiki-frontend/src/api.js

import axios from 'axios';

// ★★★ 修正箇所: ローカル開発環境を優先する設定に戻します ★★★



// 開発中は localhost:8000, 本番は Cloud Run
const API_URL = process.env.REACT_APP_API_URL || 'https://backend-api-1060579851059.asia-northeast1.run.app';

// ※ もし一時的に本番に繋ぎたい場合は、上記の条件分岐をコメントアウトして
// const API_URL = 'https://backend-api-...'; 
// を有効にしてください。ただし、AI機能開発中はローカル推奨です。

const api = axios.create({
  baseURL: API_URL,
});

// Axiosのインターセプター (変更なし)
api.interceptors.request.use(
  (config) => {
    // トークンキー名は統一されていますか？ aiApi.jsでは accessToken/token 両方見ましたが
    // ここでは accessToken となっています。ログイン処理の実装に合わせてください。
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

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('accessToken');
      // window.location.href = '/'; 
      // 開発中のリロードループを防ぐため、アラートだけにするか、慎重にリダイレクトしてください
      console.warn('セッション切れ: ログインし直してください');
    }
    return Promise.reject(error);
  }
);

/**
 * ログイン履歴を取得する (管理者用)
 * @returns {Promise<Array>} ログイン履歴の配列
 */
export const getLoginHistory = async () => {
    try {
        const response = await api.get('/admin/login-history/');
        return response.data;
    } catch (error) {
        console.error("ログイン履歴の取得に失敗しました:", error.response || error);
        throw error;
    }
};

/**
 * 営業活動の履歴を取得する (管理者用)
 * @returns {Promise<Array>} 活動履歴の配列
 */
export const getActivityLogs = async () => {
    try {
        const response = await api.get('/admin/activity-logs/');
        return response.data;
    } catch (error) {
        console.error("活動履歴の取得に失敗しました:", error.response || error);
        throw error;
    }
};

export const getEngineers = async () => {
  const response = await api.get('/engineers/');
  return response.data;
};

// 顧客一覧取得（プルダウン用）
export const getCustomers = async () => {
  const response = await api.get('/customers/');
  return response.data;
};

// 案件登録
export const createOpportunity = async (data) => {
  const response = await api.post('/opportunities/', data);
  return response.data;
};

/**
 * Wikiページ一覧をページネーション付きで取得
 * @param {number} skip - 読み飛ばす件数 (page * rowsPerPage)
 * @param {number} limit - 1ページあたりの件数
 */
export const getPages = async (skip = 0, limit = 10) => {
    // クエリパラメータで skip と limit を送る
    const response = await api.get(`/pages/?skip=${skip}&limit=${limit}`);
    return response.data;
};

/**
 * 管理者用: 全チャットセッション一覧を取得
 */
export const getAdminChatSessions = async (skip = 0, limit = 50) => {
  const response = await api.get(`/admin/chat-logs/sessions?skip=${skip}&limit=${limit}`);
  return response.data;
};

/**
 * 管理者用: セッション内のメッセージ履歴を取得
 */
export const getAdminSessionMessages = async (sessionId) => {
  const response = await api.get(`/admin/chat-logs/sessions/${sessionId}/messages`);
  return response.data;
};

export default api;