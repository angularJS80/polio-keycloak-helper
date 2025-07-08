import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { useMessage } from '../hooks/useMessage';
import CommonMessageDialog from '../components/CommonMessageDialog';
import { usePasswordFindPage } from '../hooks/usePasswordFindPage';

export default function PasswordFindPage() {
  const navigate = useNavigate();
  const { message, showSuccess, showError, clearMessage } = useMessage();
  const {
    email,
    setEmail,
    handleFindPassword,
    loading,
  } = usePasswordFindPage(showSuccess, showError);

  return (
    <Layout>
      <PageHeader icon={SearchIcon} title="비밀번호 찾기" iconColor='#FFD700' />
      <CommonMessageDialog message={message} onClose={clearMessage} />
      <Box sx={{ maxWidth: 400, mx: 'auto', my: 5, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
          <TextField
            fullWidth
            label="이메일"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2, fontWeight: 700 }}
            onClick={() => handleFindPassword('이메일 전송 성공','이메일 전송 실패')}
            disabled={loading}
          >
            {loading ? '전송 중...' : '비밀번호 찾기'}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="info"
            size="large"
            sx={{ mt: 1, fontWeight: 700 }}
            onClick={() => navigate('/login')}
            disabled={loading}
          >
            로그인 페이지로 돌아가기
          </Button>
      </Box>
    </Layout>
  );
} 