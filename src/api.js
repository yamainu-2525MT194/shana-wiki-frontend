import axios from 'axios';

// APIのベースURLを設定
const API_URL = 'https://backend-api-1060579851059.asia-northeast1.run.app';

const api = axios.create({
  baseURL: API_URL,
});

// ★★★【最重要】★★★
// Axiosのインターセプター機能を使って、全てのリクエストの直前に処理を挟む
api.interceptors.request.use(
  (config) => {
    // 1. localStorageから最新のトークンを取得
    const token = localStorage.getItem('accessToken');
    
    // 2. もしトークンが存在すれば、リクエストヘッダーにセットする
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 3. 変更を加えた設定(config)でリクエストを送信する
    return config;
  },
  (error) => {
    // リクエストエラーの場合は、そのままエラーを返す
    return Promise.reject(error);
  }
);

// ★★★【推奨】★★★
// レスポンスに対するインターセプターで、認証エラーを一括処理する
api.interceptors.response.use(
  (response) => {
    // 正常なレスポンスはそのまま返す
    return response;
  },
  (error) => {
    // 401エラー（認証失敗）が発生した場合の共通処理
    if (error.response && error.response.status === 401) {
      // 古いトークンを削除
      localStorage.removeItem('accessToken');
      // ログインページにリダイレクト
      window.location.href = '/'; 
      alert('セッションの有効期限が切れました。再度ログインしてください。');
    }
    // その他のエラーはそのまま返す
    return Promise.reject(error);
  }
);

export default api;