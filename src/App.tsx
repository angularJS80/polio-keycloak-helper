import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetch('http://localhost:8080/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((user) => setUsername(user.username));
    }
  }, [token]);

  if (!token) {
    return <LoginForm onLogin={setToken} />;
  }

  return (
    <div>
      <h1>환영합니다, {username}님!</h1>
      <button onClick={() => setToken(null)}>로그아웃</button>
    </div>
  );
}

export default App;
