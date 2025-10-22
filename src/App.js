import React from 'react';
import LoginPage from './LoginPage'; // LoginPageをインポート
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <LoginPage /> {/* LoginPageコンポーセントを表示 */}
      </header>
    </div>
  );
}

export default App;