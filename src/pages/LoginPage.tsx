import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FastAuthProvider, fastAuthApiRequest } from 'fast-auth-with-keycloak';
import { getAccessToken } from 'fast-auth-with-keycloak/token';
// import { setupAutoRefresh } from 'fast-auth-with-keycloak'; // 이 줄을 제거하거나 주석 처리
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LockIcon from '@mui/icons-material/Lock';
import Alert from '@mui/material/Alert';

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

function getJoinEndpoint() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      const config = JSON.parse(saved);
      return config.joinEndpoint || '';
    } catch {
      return '';
    }
  }
  return '';
}

export default function LoginPage() {
  const [loginState, setLoginState] = useState({ username: '', password: '', loading: false, error: '' });
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    ensureInit();
    const token = getAccessToken();
    if (token) {
      try {
        FastAuthProvider.getConfig();
      } catch {}
    }
  }, []);

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', my: 5, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <LockIcon sx={{ mr: 1, color: '#b04a5a', fontSize: 32 }} />
        <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>
          인증이 뭔지 보여줄게 <span style={{ fontSize: 28, marginLeft: 8 }}>🕶️</span>
        </Typography>
      </Box>
      {alertMessage && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {alertMessage}
        </Alert>
      )}
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
      <Button
        fullWidth
        variant="outlined"
        color="secondary"
        size="large"
        sx={{ mt: 1, fontWeight: 700 }}
        onClick={() => {
          setAlertMessage(null);
          const joinEndpoint = getJoinEndpoint();
          if (joinEndpoint) {
            navigate('/join');
          } else {
            setAlertMessage('계정 등록 엔드포인트가 초기화 설정에 설정되지 않았습니다. 초기화면에서 설정해주세요.');
          }
        }}
      >
        계정 등록
      </Button>
      {loginState.error && <Typography color="error" sx={{ mt: 1 }}>{loginState.error}</Typography>}
    </Box>
  );
} 