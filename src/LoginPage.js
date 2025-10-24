import React, { useState } from 'react';
import axios from 'axios'; // axiosをインポート
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  const navigate = useNavigate();
  // 入力されたメールアドレスとパスワードを記憶するための変数
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // ログインボタンが押されたときの処理
  const handleLogin = async (e) => {
    e.preventDefault(); // フォームのデフォルトの送信動作をキャンセル
    setError(''); // エラーメッセージをリセット

    try {
      // バックエンドの/login APIにデータを送信するための準備
      const params = new URLSearchParams();
      params.append('username', email);
      params.append('password', password);

      // axiosを使って、バックエンドにPOSTリクエストを送信
      const response = await axios.post('https://backend-api-1060579851059.asia-northeast1.run.app/login', params);

      // 成功した場合の処理
      const accessToken = response.data.access_token;
      console.log("ログイン成功:", accessToken);
      // alert("ログインに成功しました！この先のページはまだ開発中なので少々お待ちください");

      // ★重要★ 受け取った通行証(トークン)をブラウザの安全な場所に保管
      localStorage.setItem('accessToken', accessToken);

      // ここでログイン後のページに移動する処理を後で追加します
      // window.location.href = '/dashboard';

      navigate('/dashboard'); // ← ★★★ 3. ログイン成功後、ダッシュボードへ案内 ★★★

    } catch (err) {
      // 失敗した場合の処理
      console.error("ログイン失敗:", err);
      setError("メールアドレスまたはパスワードが違います。");
    }
  };

  return (
    <div>
      <h2>社内Wiki ログイン</h2>
      {/* ログインフォーム */}
      <form onSubmit={handleLogin}>
        <div>
          <label>メールアドレス:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>パスワード:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">ログイン</button>
      </form>
      {/* エラーメッセージの表示 */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default LoginPage;