import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPage() {
  // 取得したユーザーの一覧を記憶するための変数
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // このページが初めて表示された時に、一度だけ実行される処理
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // ブラウザに保管されている通行証(トークン)を取得
        const token = localStorage.getItem('accessToken');
        if (!token) {
          setError("ログインしていません。");
          setLoading(false);
          return;
        }

        // バックエンドの /users/ APIに問い合わせる
        // ★重要★ 通行証をヘッダーに付けて送信する
        const response = await axios.get('https://backend-api-1060579851059.asia-northeast1.run.app/users/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // 返ってきたユーザー一覧を記憶する
        setUsers(response.data);
      } catch (err) {
        console.error("ユーザー一覧の取得に失敗しました:", err);
        setError("ユーザー一覧の取得に失敗しました。管理者権限がありません。");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []); // []が空なので、初回の一度しか実行されない

  // ユーザーを削除する処理
  const handleDeleteUser = async (userId) => {
    if (window.confirm(`本当にユーザーID: ${userId} を削除しますか？`)) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`https://backend-api-....run.app/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // 画面から削除されたユーザーを即座に消す
        setUsers(users.filter(user => user.id !== userId));
        alert(`ユーザーID: ${userId} を削除しました。`);
      } catch (err) {
        console.error("ユーザーの削除に失敗しました:", err);
        alert("ユーザーの削除に失敗しました。");
      }
    }
  };

  // ユーザーの役割を変更する処理
  const handleUpdateRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('accessToken');
      // FastAPIのPUTリクエストではURLパラメータでデータを送る
      await axios.put(`https://backend-api-....run.app/users/${userId}/role?role=${newRole}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 画面上のユーザーの役割を即座に更新する
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));
      alert(`ユーザーID: ${userId} の役割を ${newRole} に変更しました。`);
    } catch (err) {
      console.error("役割の更新に失敗しました:", err);
      alert("役割の更新に失敗しました。");
    }
  };

  if (loading) {
    return <p>ユーザー情報を読み込み中...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h1>管理者ダッシュボード</h1>
      <p>ここでユーザーの管理を行います。</p>

      {/* ユーザー一覧のテーブル */}
      <table border="1" style={{ marginTop: '20px', width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>名前</th>
            <th>Email</th>
            <th>役割</th>
            <th>部署ID</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.department_id}</td>
              <td>
                {user.role !== 'admin' && (
                  <button onClick={() => handleUpdateRole(user.id, 'admin')}>
                    管理者に昇格
                  </button>
                )}
                <button onClick={() => handleDeleteUser(user.id)} style={{ marginLeft: '5px' }}>
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminPage;