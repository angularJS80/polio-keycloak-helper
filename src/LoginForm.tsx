import React, { useState } from 'react';
import { apiPost, setAccessToken } from './keycloak/KeycloakClient'; // 👈 SDK 내부 함수 사용

type Props = {
  onLogin: (token: string) => void;
};

export default function LoginForm({ onLogin }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    try {
      const res = await apiPost('/auth/login', {
        username,
        password,
      });

      const token = res.access_token;
      setAccessToken(token);       // 👈 이후 모든 API 요청에 Authorization 헤더 자동 추가
      onLogin(token);
    } catch (err) {
      alert('로그인 실패');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>로그인</h2>
      <input
        placeholder="아이디"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={login}>로그인</button>
    </div>
  );
}
