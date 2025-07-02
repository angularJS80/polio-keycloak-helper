import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { fastAuthApiRequest } from 'fast-auth-with-keycloak';
import { getAccessToken } from 'fast-auth-with-keycloak/token';
import { getPasswordChangeEndpoint } from 'fast-auth-with-keycloak/config';

export default function PasswordChangePage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    const accessToken = getAccessToken();
    if (!accessToken) {
      setMessage({ type: 'error', text: '로그인 상태가 아닙니다. 다시 로그인 해주세요.' });
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 일치하지 않습니다.' });
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: '새 비밀번호는 최소 6자 이상이어야 합니다.' });
      setLoading(false);
      return;
    }

    const passwordChangeEndpoint = getPasswordChangeEndpoint();
    if (!passwordChangeEndpoint) {
      setMessage({ type: 'error', text: '비밀번호 변경 엔드포인트가 초기화 설정에 설정되지 않았습니다. 초기화면에서 설정해주세요.' });
      setLoading(false);
      return;
    }

    try {
      await fastAuthApiRequest(passwordChangeEndpoint, {
        method: 'PUT',
        body: {
          newPassword: newPassword,
        },
      });

      // fastAuthApiRequest가 오류를 던지지 않았다면 성공으로 간주
      setMessage({ type: 'success', text: '비밀번호가 성공적으로 변경되었습니다!' });
      setNewPassword('');
      setConfirmNewPassword('');
      // Optionally navigate to login page or welcome page
      // navigate('/login'); 
    } catch (err: any) {
      // fastAuthApiRequest에서 던져진 오류를 처리
      const errorMessage = err instanceof Error ? err.message : String(err);
      setMessage({ type: 'error', text: `네트워크 오류 또는 서버 응답 없음: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', my: 5, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <VpnKeyIcon sx={{ mr: 1, color: '#009e6d', fontSize: 32 }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>비밀번호 변경</Typography>
      </Box>
      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}
      <form onSubmit={handleSubmit}>
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
          type="submit"
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
      </form>
    </Box>
  );
} 