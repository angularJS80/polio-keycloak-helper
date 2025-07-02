import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { fastAuthApiRequest } from 'fast-auth-with-keycloak';
import { getPasswordFindEndpoint } from 'fast-auth-with-keycloak/config';

export default function PasswordFindPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);
    setLoading(true);

    const passwordFindEndpoint = getPasswordFindEndpoint();
    if (!passwordFindEndpoint) {
      setMessage({ type: 'error', text: '비밀번호 찾기 엔드포인트가 초기화 설정에 설정되지 않았습니다. 초기화면에서 설정해주세요.' });
      setLoading(false);
      return;
    }

    try {
      await fastAuthApiRequest(passwordFindEndpoint, {
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
    <Box sx={{ maxWidth: 400, mx: 'auto', my: 5, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <SearchIcon sx={{ mr: 1, color: '#009e6d', fontSize: 32 }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>비밀번호 찾기</Typography>
      </Box>
      {message && (
        <Alert severity={message.type} sx={{ mb: 2 }}>
          {message.text}
        </Alert>
      )}
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
  );
} 