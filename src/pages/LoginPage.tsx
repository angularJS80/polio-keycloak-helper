import React from 'react';
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
import PageHeader from '../components/PageHeader';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PublicIcon from '@mui/icons-material/Public';
import Stack from '@mui/material/Stack';
import { useLoginPage } from '../hooks/useLoginPage';

export default function LoginPage() {
  const {
    loginState,
    setLoginState,
    alertMessage,
    handleCloseAlert,
    handleLogin,
    handlePasswordFind,
    handleJoin,
    handleSocialLogin,
    initConfig,
  } = useLoginPage();

  return (
    <Layout>
      <PageHeader 
        icon={LockIcon} 
        title="인증이 뭔지 보여줄게" 
        iconColor='#b04a5a'
        showSettingsIcon={true}
        onSettingsClick={() => handlePasswordFind()}
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
        onClick={handlePasswordFind}
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
          onClick={handleJoin}
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
            onClick={handleSocialLogin}
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