import axios from 'axios';

// ★★★【最重要】★★★
// 現在の環境が 'development' (ローカル) かどうかを判定
const isDevelopment = process.env.NODE_ENV === 'development';

// 環境に応じてAPIのベースURLを切り替える
const API_URL = isDevelopment 
  ? 'http://localhost:8000' // 開発環境ではローカルのバックエンドを指す
  : 'https://backend-api-1060579851059.asia-northeast1.run.app'; // 本番環境ではGCPを指す

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

export default api;