import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import WarningIcon from '@mui/icons-material/Warning';
import Stack from '@mui/material/Stack';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import { fastAuthApiRequest } from 'fast-auth-with-keycloak';
import { hasAccessToken } from 'fast-auth-with-keycloak/token';
import { getPasswordChangeEndpoint, hasPasswordChangeEndpoint } from 'fast-auth-with-keycloak/config';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

export default function PasswordChangePage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCloseMessage = () => {
    setMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    if (!hasAccessToken()) {
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

    
    if (!hasPasswordChangeEndpoint()) {
      setMessage({ type: 'error', text: '비밀번호 변경 엔드포인트가 초기화 설정에 설정되지 않았습니다. 초기화면에서 설정해주세요.' });
      setLoading(false);
      return;
    }

    try {
      await fastAuthApiRequest(getPasswordChangeEndpoint(), {
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
    <Layout>
      <PageHeader icon={VpnKeyIcon} title="비밀번호 변경" iconColor='#00CED1' />
      {message && (
        <Dialog
          open={!!message}
          onClose={handleCloseMessage}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            <Stack direction="row" alignItems="center" spacing={1}>
              <WarningIcon color={message.type === "success" ? "success" : "warning"} />
              <Typography variant="h6">알림</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Typography id="alert-dialog-description">
              {message.text}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMessage} autoFocus>확인</Button>
          </DialogActions>
        </Dialog>
      )}
      <Box sx={{ maxWidth: 400, mx: 'auto', my: 5, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <VpnKeyIcon sx={{ mr: 1, color: '#009e6d', fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>비밀번호 변경</Typography>
        </Box>
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
    </Layout>
  );
} 