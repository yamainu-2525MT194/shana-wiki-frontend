import axios from 'axios';

// ★★★【最重要】★★★
// 一時的にローカル判定を無効化し、常に本番URLを使うようにします
/*
const isDevelopment = process.env.NODE_ENV === 'development';

const API_URL = isDevelopment 
  ? 'http://localhost:8000' 
  : 'https://backend-api-1060579851059.asia-northeast1.run.app'; 
*/

// 環境に応じてAPIのベースURLを切り替える
const API_URL  = 'https://backend-api-1060579851059.asia-northeast1.run.app';

const api = axios.create({
  baseURL: API_URL,
});

// Axiosのインターセプター (これは変更なし)
api.interceptors.request.use(
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

api.interceptors.response.use(
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

export default api;