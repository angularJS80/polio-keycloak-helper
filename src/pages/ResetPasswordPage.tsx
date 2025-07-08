import React from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { useMessage } from '../hooks/useMessage';
import CommonMessageDialog from '../components/CommonMessageDialog';
import { useResetPasswordPage } from '../hooks/useResetPasswordPage';

export default function ResetPasswordPage() {
  const { message, showSuccess, showError, clearMessage } = useMessage();
  const {
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    handleResetPassword,
    loading,
    handleGoToLogin,
  } = useResetPasswordPage(showSuccess, showError);

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', my: 5, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <VpnKeyIcon sx={{ mr: 1, color: '#009e6d', fontSize: 32 }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>비밀번호 재설정</Typography>
      </Box>
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
          onClick={() => handleResetPassword('비밀번호 재설정 성공','비밀번호 재설정 실패')}
          disabled={loading}
        >
          {loading ? '변경 중...' : '비밀번호 재설정'}
        </Button>
        <Button
          fullWidth
          variant="outlined"
          color="info"
          size="large"
          sx={{ mt: 1, fontWeight: 700 }}
          onClick={handleGoToLogin}
          disabled={loading}
        >
          로그인 페이지로 돌아가기
        </Button>
    </Box>
  );
} 