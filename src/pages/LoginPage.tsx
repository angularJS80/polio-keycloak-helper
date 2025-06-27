import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FastAuthProvider, fastAuthApiRequest } from '../fast-auth-with-keycloak';
import { getAccessToken } from '../fast-auth-with-keycloak/token';
import { setupAutoRefresh } from '../fast-auth-with-keycloak';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LockIcon from '@mui/icons-material/Lock';

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
    const token = getAccessToken();
    if (token) {
      try {
        FastAuthProvider.getConfig();
        setupAutoRefresh();
      } catch {}
    }
  }, []);

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', my: 5, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <LockIcon sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 700 }}>로그인</Typography>
      </Box>
      <TextField
        fullWidth
        label="아이디"
        variant="outlined"
        margin="normal"
        value={loginState.username}
        onChange={e => setLoginState({ ...loginState, username: e.target.value })}
      />
      <TextField
        fullWidth
        label="비밀번호"
        type="password"
        variant="outlined"
        margin="normal"
        value={loginState.password}
        onChange={e => setLoginState({ ...loginState, password: e.target.value })}
      />
      <Button
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        sx={{ mt: 2, mb: 1, fontWeight: 700 }}
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
      </Button>
      {loginState.error && <Typography color="error" sx={{ mt: 1 }}>{loginState.error}</Typography>}
    </Box>
  );
} 