import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FastAuthProvider } from 'fast-auth-with-keycloak';
import { DEFAULT_AUTH_CONFIG } from '../config';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import SettingsIcon from '@mui/icons-material/Settings';

const LOCAL_STORAGE_KEY = 'fast-auth-init-config';

function loadInitConfig() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return {
        ...DEFAULT_AUTH_CONFIG,
        profileAfterLogin: false,
        profileEndpoint: '/me',
        joinEndpoint: '/join',
        passwordChangeEndpoint: '/password-change',
      };
    }
  }
  return {
    ...DEFAULT_AUTH_CONFIG,
    profileAfterLogin: false,
    profileEndpoint: '/me',
    joinEndpoint: '/join',
    passwordChangeEndpoint: '/password-change',
  };
}

export default function InitPage() {
  const [initConfig, setInitConfig] = useState(loadInitConfig());
  const navigate = useNavigate();
  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', my: 5, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SettingsIcon sx={{ mr: 1, color: '#009e6d', fontSize: 32 }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>인증 엄청 귀찮지? 한방에!</Typography>
      </Box>
      <TextField
        fullWidth
        label="Base URL"
        variant="outlined"
        margin="normal"
        value={initConfig.baseUrl}
        onChange={e => setInitConfig({ ...initConfig, baseUrl: e.target.value })}
      />
      <TextField
        fullWidth
        label="계정등록 엔드포인트"
        variant="outlined"
        margin="normal"
        value={initConfig.joinEndpoint || ''}
        onChange={e => setInitConfig({ ...initConfig, joinEndpoint: e.target.value })}
      />
      <TextField
        fullWidth
        label="로그인 엔드포인트"
        variant="outlined"
        margin="normal"
        value={initConfig.loginEndpoint}
        onChange={e => setInitConfig({ ...initConfig, loginEndpoint: e.target.value })}
      />
      <TextField
        fullWidth
        label="비밀번호 변경 엔드포인트"
        variant="outlined"
        margin="normal"
        value={initConfig.passwordChangeEndpoint || ''}
        onChange={e => setInitConfig({ ...initConfig, passwordChangeEndpoint: e.target.value })}
      />
      <TextField
        fullWidth
        label="로그아웃 엔드포인트"
        variant="outlined"
        margin="normal"
        value={initConfig.logoutEndpoint || ''}
        onChange={e => setInitConfig({ ...initConfig, logoutEndpoint: e.target.value })}
      />
      <TextField
        fullWidth
        label="리프레쉬 엔드포인트"
        variant="outlined"
        margin="normal"
        value={initConfig.refreshEndpoint}
        onChange={e => setInitConfig({ ...initConfig, refreshEndpoint: e.target.value })}
      />
      <FormControlLabel
        control={<Checkbox checked={initConfig.autoRefresh} onChange={e => setInitConfig({ ...initConfig, autoRefresh: e.target.checked })} />}
        label="토큰 자동 갱신"
        sx={{ mb: 1 }}
      />
      {initConfig.autoRefresh && (
        <TextField
          fullWidth
          type="number"
          label="토큰 만료 갱신 시점(초 전)"
          variant="outlined"
          margin="normal"
          inputProps={{ min: 1 }}
          value={initConfig.refreshBeforeExpirySec || 1}
          onChange={e => setInitConfig({ ...initConfig, refreshBeforeExpirySec: Number(e.target.value) })}
        />
      )}
      {!initConfig.autoRefresh && (
        <>
          <FormControlLabel
            control={<Checkbox checked={initConfig.sessionExpiryAlertEnabled || false} onChange={e => setInitConfig({ ...initConfig, sessionExpiryAlertEnabled: e.target.checked })} />}
            label="토큰 만료 전 알림 활성화"
            sx={{ mb: 1 }}
          />
          {initConfig.sessionExpiryAlertEnabled && (
            <TextField
              fullWidth
              type="number"
              label="토큰 만료 전 알림 시간(초)"
              variant="outlined"
              margin="normal"
              inputProps={{ min: 1 }}
              value={initConfig.sessionExpiryAlertSec || 30}
              onChange={e => setInitConfig({ ...initConfig, sessionExpiryAlertSec: Number(e.target.value) })}
            />
          )}
        </>
      )}
      <TextField
        fullWidth
        label="만료시 리다이렉트 경로"
        variant="outlined"
        margin="normal"
        value={initConfig.onTokenExpiredRedirect}
        onChange={e => setInitConfig({ ...initConfig, onTokenExpiredRedirect: e.target.value })}
      />
      <FormControlLabel
        control={<Checkbox checked={initConfig.profileAfterLogin} onChange={e => setInitConfig({ ...initConfig, profileAfterLogin: e.target.checked })} />}
        label="로그인 후 프로필 조회"
        sx={{ mb: 1 }}
      />
      {initConfig.profileAfterLogin && (
        <TextField
          fullWidth
          label="프로필 엔드포인트"
          variant="outlined"
          margin="normal"
          value={initConfig.profileEndpoint}
          onChange={e => setInitConfig({ ...initConfig, profileEndpoint: e.target.value })}
        />
      )}
      <FormControlLabel
        control={<Checkbox checked={initConfig.redirectAfterLogin} onChange={e => setInitConfig({ ...initConfig, redirectAfterLogin: e.target.checked })} />}
        label="로그인 후 이동"
        sx={{ mb: 1 }}
      />
      {initConfig.redirectAfterLogin && (
        <TextField
          fullWidth
          label="이동 경로"
          variant="outlined"
          margin="normal"
          value={initConfig.redirectPath || ''}
          onChange={e => setInitConfig({ ...initConfig, redirectPath: e.target.value })}
        />
      )}
      <Button
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        sx={{ mt: 2, fontWeight: 700 }}
        onClick={() => {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initConfig));
          FastAuthProvider.init(initConfig);
          navigate('/login');
        }}
      >
        저장
      </Button>
    </Box>
  );
} 