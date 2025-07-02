import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { getConfig, getPasswordResetEndpoint } from 'fast-auth-with-keycloak/config';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    const queryParams = new URLSearchParams(location.search);
    const urlAccessToken = queryParams.get('access_token');

    if (!urlAccessToken) {
      setMessage({ type: 'error', text: '유효한 접근 토큰이 없습니다.' });
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

    const initConfig = getConfig();
    const passwordResetEndpoint = getPasswordResetEndpoint();
    if (!passwordResetEndpoint) {
      setMessage({ type: 'error', text: '비밀번호 초기화 엔드포인트가 초기화 설정에 설정되지 않았습니다. 초기화면에서 설정해주세요.' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${initConfig.baseUrl}${passwordResetEndpoint}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${urlAccessToken}`,
          },
          body: JSON.stringify({ newPassword: newPassword }),
        }
      );

      if (response.ok) {
        setMessage({ type: 'success', text: '비밀번호가 성공적으로 변경되었습니다!' });
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: `비밀번호 초기화 실패: ${errorData.message || '알 수 없는 오류'}` });
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setMessage({ type: 'error', text: `비밀번호 초기화 실패: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', my: 5, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <VpnKeyIcon sx={{ mr: 1, color: '#009e6d', fontSize: 32 }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>비밀번호 재설정</Typography>
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
          {loading ? '변경 중...' : '비밀번호 재설정'}
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
      </form>
    </Box>
  );
} 