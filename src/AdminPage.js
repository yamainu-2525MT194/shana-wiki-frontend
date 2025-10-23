import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminPage() {
  // 取得したユーザーの一覧を記憶するための変数
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]); // ← 部署一覧用の変数を追加
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // --- ↓↓↓ 新規ユーザーフォーム用の変数を追加 ↓↓↓ ---
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserDepartmentId, setNewUserDepartmentId] = useState('1'); // デフォルトを1に
  const [newDepartmentName, setNewDepartmentName] = useState('');
  // --- ↑↑↑ 新規部署フォーム用の変数を追加 ↑↑↑ ---

  const API_URL = 'https://backend-api-1060579851059.asia-northeast1.run.app'; // ★重要★ あなたのバックエンドURL

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
        const response = await axios.get(`${API_URL}/users/`, {
        headers: { Authorization: `Bearer ${token}` }
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
  }, []);

  // ユーザーを削除する処理
  const handleDeleteUser = async (userId) => {
    if (window.confirm(`本当にユーザーID: ${userId} を削除しますか？`)) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`${API_URL}/users/${userId}`, {
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
      await axios.put(`${API_URL}/users/${userId}/role?role=${newRole}`, {}, {
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

  // --- ↓↓↓ 新規ユーザー作成処理を追加 ↓↓↓ ---
  const handleCreateUser = async (e) => {
    e.preventDefault(); // フォームのデフォルト送信をキャンセル
    try {
      const token = localStorage.getItem('accessToken');
      const newUser = {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        department_id: parseInt(newUserDepartmentId)
      };
      
      await axios.post(`${API_URL}/users/`, newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('新しいユーザーを作成しました！');
      // フォームをリセット
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      // ユーザー一覧を再取得して画面を更新
      fetchUsers();
    } catch (err) {
      console.error("ユーザーの作成に失敗しました:", err);
      alert("ユーザーの作成に失敗しました。メールアドレスが重複している可能性があります。");
    }
  };
  // --- ↑↑↑ 新規ユーザー作成処理を追加 ↑↑↑ ---

  // --- ↓↓↓ 部署のCRUD処理を追加 ↓↓↓ ---
  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`${API_URL}/departments/`, { name: newDepartmentName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('新しい部署を作成しました！');
      setNewDepartmentName('');
      // データを再取得して画面を更新
      setLoading(true);
      // Simulating a refetch. In a real app, you'd call fetchData() again.
      window.location.reload(); 
    } catch (err) {
      alert("部署の作成に失敗しました。");
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    if (window.confirm(`本当に部署ID: ${departmentId} を削除しますか？\nこの部署に所属するユーザーがいる場合、エラーになります。`)) {
      try {
        const token = localStorage.getItem('accessToken');
        await axios.delete(`${API_URL}/departments/${departmentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDepartments(departments.filter(dep => dep.id !== departmentId));
        alert(`部署ID: ${departmentId} を削除しました。`);
      } catch (err) {
        alert("部署の削除に失敗しました。所属ユーザーがいないか確認してください。");
      }
    }
  };
  // --- ↑↑↑ 部署のCRUD処理を追加 ↑↑↑ ---

  if (loading) {
    return <p>ユーザー情報を読み込み中...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <div>
      <h1>管理者ダッシュボード</h1>
    {/* --- ↓↓↓ 新規ユーザー登録フォーム ↓↓↓ --- */}
      <div style={{ margin: '20px 0', padding: '20px', border: '1px solid white' }}>
        <h3>新規ユーザー登録</h3>
        <form onSubmit={handleCreateUser}>
          <div style={{ marginBottom: '10px' }}>
            <label>名前: </label>
            <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Email: </label>
            <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>パスワード: </label>
            <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} required />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>部署ID: </label>
            <input type="number" value={newUserDepartmentId} onChange={(e) => setNewUserDepartmentId(e.target.value)} required />
          </div>
          <button type="submit">ユーザーを作成</button>
        </form>
      </div>
      {/* --- ↑↑↑ 新規ユーザー登録フォーム ↑↑↑ --- */}

      {/* --- ↓↓↓ 新規部署登録フォームを追加 ↓↓↓ --- */}
      <div style={{ margin: '20px 0', padding: '20px', border: '1px solid white' }}>
        <h3>新規部署登録</h3>
        <form onSubmit={handleCreateDepartment}>
          <div style={{ marginBottom: '10px' }}>
            <label>部署名: </label>
            <input type="text" value={newDepartmentName} onChange={(e) => setNewDepartmentName(e.target.value)} required />
          </div>
          <button type="submit">部署を作成</button>
        </form>
      </div>
      {/* --- ↑↑↑ 新規部署登録フォームを追加 ↑↑↑ --- */}

      {/* --- ↓↓↓ 部署一覧テーブルを追加 ↓↓↓ --- */}
      <h2>既存部署一覧</h2>
      <table border="1" style={{ marginTop: '20px', width: '100%' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>部署名</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {departments.map(dep => (
            <tr key={dep.id}>
              <td>{dep.id}</td>
              <td>{dep.name}</td>
              <td>
                <button onClick={() => handleDeleteDepartment(dep.id)}>
                  削除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* --- ↑↑↑ 部署一覧テーブルを追加 ↑↑↑ --- */}

      <h2>既存ユーザー一覧</h2>

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