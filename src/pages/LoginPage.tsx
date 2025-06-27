import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FastAuthProvider, fastAuthApiRequest } from '../fast-auth-with-keycloak';

const LOCAL_STORAGE_KEY = 'fast-auth-init-config';

function ensureInit() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      FastAuthProvider.init(JSON.parse(saved));
    } catch {}
  }
}

function getProfileConfig() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      const config = JSON.parse(saved);
      return {
        profileAfterLogin: !!config.profileAfterLogin,
        profileEndpoint: config.profileEndpoint || '/me',
      };
    } catch {}
  }
  return { profileAfterLogin: false, profileEndpoint: '/me' };
}

function getRedirectConfig() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      const config = JSON.parse(saved);
      return {
        redirectAfterLogin: !!config.redirectAfterLogin,
        redirectPath: config.redirectPath || '/welcome',
      };
    } catch {}
  }
  return { redirectAfterLogin: false, redirectPath: '/welcome' };
}

export default function LoginPage() {
  const [loginState, setLoginState] = useState({ username: '', password: '', loading: false, error: '' });
  const navigate = useNavigate();

  useEffect(() => {
    ensureInit();
  }, []);

  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>로그인</h2>
      <label style={{ fontWeight: 'bold' }}>아이디</label>
      <input
        style={{ width: '100%', marginBottom: 8 }}
        placeholder="아이디"
        value={loginState.username}
        onChange={e => setLoginState({ ...loginState, username: e.target.value })}
      />
      <label style={{ fontWeight: 'bold' }}>비밀번호</label>
      <input
        type="password"
        style={{ width: '100%', marginBottom: 8 }}
        placeholder="비밀번호"
        value={loginState.password}
        onChange={e => setLoginState({ ...loginState, password: e.target.value })}
      />
      <button
        style={{ width: '100%', padding: 10, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}
        disabled={loginState.loading}
        onClick={async () => {
          setLoginState(s => ({ ...s, loading: true, error: '' }));
          try {
            await FastAuthProvider.login({ username: loginState.username, password: loginState.password });
            const { profileAfterLogin, profileEndpoint } = getProfileConfig();
            if (profileAfterLogin) {
              const user = await fastAuthApiRequest(profileEndpoint);
              sessionStorage.setItem('fast-auth-username', user.username);
            }
            const { redirectAfterLogin, redirectPath } = getRedirectConfig();
            if (redirectAfterLogin && redirectPath) {
              navigate(redirectPath);
            }
          } catch (err) {
            setLoginState(s => ({ ...s, error: '로그인 실패', loading: false }));
          }
        }}
      >
        {loginState.loading ? '로그인 중...' : '로그인'}
      </button>
      {loginState.error && <div style={{ color: 'red', marginTop: 8 }}>{loginState.error}</div>}
    </div>
  );
} 