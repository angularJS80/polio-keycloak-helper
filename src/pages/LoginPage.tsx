import React from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import LockIcon from '@mui/icons-material/Lock';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PublicIcon from '@mui/icons-material/Public';
import Stack from '@mui/material/Stack';
import { useLoginPage } from '../hooks/useLoginPage';
import { useNavigate } from 'react-router-dom';
import { useMessage } from '../hooks/useMessage';
import CommonMessageDialog from '../components/CommonMessageDialog';


export default function LoginPage() {
  const {
    loginState,
    setLoginState,
    handleLogin,
    handleSocialLogin,
  } = useLoginPage();
  const { message, clearMessage } = useMessage();
  const navigate = useNavigate();

  return (
    <Layout>
      <PageHeader 
        icon={LockIcon} 
        title="Cursor가 만든 200Kg 코드 40Kg다이어트 작전" 
        iconColor='#b04a5a'
        showSettingsIcon={true}
        onSettingsClick={()=>navigate('/config')}
      />
      <CommonMessageDialog message={message} onClose={clearMessage} />
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
        onClick={() => handleLogin('로그인에 성공하였습니다!', '로그인에 실패하였습니다.')}
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
        onClick={()=>navigate('/find-password')}
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
          onClick={()=>navigate('/join')}
          startIcon={<PersonAddIcon />}
        >
          계정 등록
        </Button>
        { (
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