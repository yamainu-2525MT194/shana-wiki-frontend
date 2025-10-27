import axios from 'axios';

const api = axios.create({
  baseURL: 'https://backend-api-1060579851059.asia-northeast1.run.app',
});

// グローバルなレスポンス警備員
api.interceptors.response.use(
  (response) => response, // 成功した場合は何もしない
  (error) => {
    // もし401エラー（認証エラー）だったら
    if (error.response && error.response.status === 401) {
      // 通行証を削除し、ログインページに強制的に移動させる
      localStorage.removeItem('accessToken');
      window.location.href = '/'; 
      alert('セッションの有効期限が切れました。再度ログインしてください。');
    }
    return Promise.reject(error);
  }
);

export default api;