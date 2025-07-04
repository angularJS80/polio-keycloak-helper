import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FastAuthProvider, fastAuthApiRequest } from 'fast-auth-with-keycloak';
import { hasAccessToken } from 'fast-auth-with-keycloak/token';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LockIcon from '@mui/icons-material/Lock';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import WarningIcon from '@mui/icons-material/Warning';
import Layout from '../components/Layout';
import { getConfig, getProfileConfig, getRedirectConfig, getJoinEndpoint } from 'fast-auth-with-keycloak/config';
import PageHeader from '../components/PageHeader'; // PageHeader 컴포넌트 임포트
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PublicIcon from '@mui/icons-material/Public';
import Stack from '@mui/material/Stack';

export default function LoginPage() {
  const [loginState, setLoginState] = useState({ username: '', password: '', loading: false, error: '' });
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const initConfig = getConfig();

  
  useEffect(() => {
    if (hasAccessToken()) {
      try {
        FastAuthProvider.getConfig();
      } catch {}
    }
  }, []);

  const handleCloseAlert = () => {
    setAlertMessage(null);
  };

  const handleLogin = async () => {
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
  };
  

  return (
    <Layout>
      <PageHeader 
        icon={LockIcon} 
        title="인증이 뭔지 보여줄게" 
        iconColor='#b04a5a'
        showSettingsIcon={true}
        onSettingsClick={() => navigate('/config')}
      />
      <Dialog
        open={!!alertMessage}
        onClose={handleCloseAlert}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          <Stack direction="row" alignItems="center" spacing={1}>
            <WarningIcon color="warning" />
            <Typography variant="h6">알림</Typography>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Typography id="alert-dialog-description">
            {alertMessage}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAlert} autoFocus>확인</Button>
        </DialogActions>
      </Dialog>
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
        onClick={handleLogin}
        startIcon={<LoginIcon />}
      >
        {loginState.loading ? '로그인 중...' : '로그인'}
      </Button>
      <Button
        fullWidth
        variant="text"
        color="secondary"
        size="large"
        sx={{ mt: 1, fontWeight: 700 }}
        onClick={() => {
          navigate('/password-find');
        }}
        startIcon={<HelpOutlineIcon />}
      >
        비밀번호 찾기
      </Button>
      <Stack direction="row" spacing={1} sx={{ mt: 2, mb: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          color="secondary"
          size="large"
          sx={{ fontWeight: 700, flexGrow: 1 }}
          onClick={() => {
            setAlertMessage(null);
            const joinEndpoint = getJoinEndpoint();
            if (joinEndpoint) {
              navigate('/join');
            } else {
              setAlertMessage('계정 등록 엔드포인트가 초기화 설정에 설정되지 않았습니다. 초기화면에서 설정해주세요.');
            }
          }}
          startIcon={<PersonAddIcon />}
        >
          계정 등록
        </Button>
        {initConfig.socialLoginEndpoint && (
          <Button
            variant="outlined"
            color="info"
            size="large"
            sx={{ fontWeight: 700, flexGrow: 1 }}
            onClick={() => {
              // 소셜 로그인 링크가 절대 경로인지 확인
              const socialLoginUrl = initConfig.socialLoginEndpoint.startsWith('http://') || initConfig.socialLoginEndpoint.startsWith('https://')
                ? initConfig.socialLoginEndpoint
                : `${initConfig.baseUrl}${initConfig.socialLoginEndpoint}`;
              window.location.href = socialLoginUrl;
            }}
            startIcon={<PublicIcon />}
          >
            소셜 로그인
          </Button>
        )}
      </Stack>
      {loginState.error && <Typography color="error" sx={{ mt: 1 }}>{loginState.error}</Typography>}
    </Layout>
  );
} 