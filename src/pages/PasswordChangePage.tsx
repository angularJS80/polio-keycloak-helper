import React from 'react';
import { TextField, Button } from '@mui/material';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { useMessage } from '../hooks/useMessage';
import CommonMessageDialog from '../components/CommonMessageDialog';
import { usePasswordChangePage } from '../hooks/usePasswordChangePage';
import { useNavigate } from 'react-router-dom';

export default function PasswordChangePage() {
  const navigate = useNavigate();
  const { message, showSuccess, showError, clearMessage } = useMessage();
  const {
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    handleChangePassword,
    loading,
  } = usePasswordChangePage(showSuccess, showError);

  return (
    <Layout>
      <PageHeader icon={VpnKeyIcon} title="비밀번호 변경" iconColor='#00CED1' />
      <CommonMessageDialog message={message} onClose={clearMessage} />
          <TextField
            fullWidth
            label="새 비밀번호"
            type="password"
            variant="outlined"
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="새 비밀번호 확인"
            type="password"
            variant="outlined"
            margin="normal"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2, fontWeight: 700 }}
            onClick={() => handleChangePassword('비밀번호 변경 성공','비밀번호 변경 실패')}
            disabled={loading}
          >
            {loading ? '변경 중...' : '비밀번호 변경'}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="info"
            size="large"
            sx={{ mt: 1, fontWeight: 700 }}
            onClick={() => navigate('/welcome')}
            disabled={loading}
          >
            환영 페이지로 돌아가기
          </Button>
    </Layout>
  );
} 