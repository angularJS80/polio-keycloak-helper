import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import WarningIcon from '@mui/icons-material/Warning';
import Stack from '@mui/material/Stack';
import SearchIcon from '@mui/icons-material/Search';
import { fastAuthApiRequest } from 'fast-auth-with-keycloak';
import { getPasswordFindEndpoint, hasPasswordFindEndpoint } from 'fast-auth-with-keycloak/config';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

export default function PasswordFindPage() {
  const [email, setEmail] = useState('');
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

    if (!hasPasswordFindEndpoint()) {
      setMessage({ type: 'error', text: '비밀번호 찾기 엔드포인트가 초기화 설정에 설정되지 않았습니다. 초기화면에서 설정해주세요.' });
      setLoading(false);
      return;
    }

    try {
      await fastAuthApiRequest(getPasswordFindEndpoint(), {
        method: 'POST',
        body: {
          email: email,
        },
        withToken: false,
      });

      setMessage({ type: 'success', text: '비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.' });
      setEmail('');
    } catch (err: any) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setMessage({ type: 'error', text: `비밀번호 찾기 실패: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <PageHeader icon={SearchIcon} title="비밀번호 찾기" iconColor='#FFD700' />
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
            type="submit"
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
        </form>
      </Box>
    </Layout>
  );
} 