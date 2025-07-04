import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import WarningIcon from '@mui/icons-material/Warning';
import Stack from '@mui/material/Stack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { fastAuthApiRequest } from 'fast-auth-with-keycloak';
import { getJoinEndpoint } from 'fast-auth-with-keycloak/config';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

export default function AccountJoinPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: '비밀번호가 일치하지 않습니다.' });
      setLoading(false);
      return;
    }

    try {
      const response = await fastAuthApiRequest(getJoinEndpoint(), {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
        withToken: false,
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '계정 등록이 성공적으로 완료되었습니다!' });
        // Optionally navigate to login page after successful registration
        // navigate('/login');
      } else {
        const errorData = await response.json();
        setMessage({ type: 'error', text: `계정 등록 실패: ${errorData.message || response.statusText}` });
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: `네트워크 오류 또는 서버 응답 없음: ${err.message}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageHeader icon={PersonAddIcon} title="계정 등록" iconColor='#4CAF50' />
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
            onClick={() => navigate('/login')}
            disabled={loading}
          >
            로그인으로 돌아가기
          </Button>
        </form>
      </Box>
    </Layout>
  );
} 