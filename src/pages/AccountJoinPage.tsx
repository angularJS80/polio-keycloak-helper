import React from 'react';
import { Box, TextField, Button } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { useMessage } from '../hooks/useMessage';
import CommonMessageDialog from '../components/CommonMessageDialog';
import { useAccountJoinPage } from '../hooks/useAccountJoinPage';
import { useNavigate } from 'react-router-dom';

export default function AccountJoinPage() {
  const navigate = useNavigate();
  const { message, showSuccess, showError, clearMessage } = useMessage();
  const {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    handleSubmit,
    loading,
  } = useAccountJoinPage(showSuccess, showError);

  return (
    <Layout>
      <PageHeader icon={PersonAddIcon} title="계정 등록" iconColor='#4CAF50' />
      <CommonMessageDialog message={message} onClose={clearMessage} />
      <Box sx={{ maxWidth: 400, mx: 'auto', my: 5, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="사용자 이름"
            variant="outlined"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="이메일"
            type="email"
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="비밀번호"
            type="password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="비밀번호 확인"
            type="password"
            variant="outlined"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2, fontWeight: 700 }}
            type="submit"
            disabled={loading}
          >
            {loading ? '등록 중...' : '등록'}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="info"
            size="large"
            sx={{ mt: 1, fontWeight: 700 }}
            onClick={()=>navigate('/join')}
            disabled={loading}
          >
            로그인으로 돌아가기
          </Button>
        </form>
      </Box>
    </Layout>
  );
} 