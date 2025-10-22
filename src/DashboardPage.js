import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function DashboardPage() {
  // ログインしているユーザーの情報を記憶するための変数
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // このページが初めて表示された時に、一度だけ実行される処理
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // ブラウザに保管されている通行証(トークン)を取得
        const token = localStorage.getItem('accessToken');
        if (!token) {
          // トークンがなければ処理を中断
          setLoading(false);
          return;
        }

        // バックエンドの /users/me APIに問い合わせる
        // ★重要★ 通行証をヘッダーに付けて送信する
        const response = await axios.get('https://backend-api-1060579851059.asia-northeast1.run.app/users/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // 返ってきたユーザー情報を記憶する
        setUser(response.data);
      } catch (error) {
        console.error("ユーザー情報の取得に失敗しました:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []); // []が空なので、初回の一度しか実行されない

  if (loading) {
    return <p>読み込み中...</p>;
  }

  return (
    <div>
      <h1>ようこそ、{user ? user.name : 'ゲスト'}さん！</h1>
      <p>ここはログインしたユーザーだけが見られるページです。</p>
      <br />
      <nav>
        {/* ★重要★ userが存在し、かつroleが'admin'の場合のみリンクを表示する */}
        {user && user.role === 'admin' && (
          <Link to="/admin">管理者ページへ</Link>
        )}
      </nav>
    </div>
  );
}

export default DashboardPage;