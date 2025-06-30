import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { fastAuthApiRequest } from 'fast-auth-with-keycloak'; // 제거
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import EmailIcon from '@mui/icons-material/Email';
import { loadInitConfig } from '../utils/authConfig';

export default function PasswordFindPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();
  const initConfig = loadInitConfig();

  const handleSubmit = async () => {
    try {
      setMessage('');
      const response = await fetch(
        `${initConfig.baseUrl}${initConfig.passwordFindEndpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      if (response.ok) {
        setMessage('비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.');
      } else {
        const errorData = await response.json();
        setMessage(errorData.message || '비밀번호 찾기 요청에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error during password find request:', error);
      setMessage('네트워크 오류 또는 서버 응답이 없습니다.');
    }
  };

  return (
    <Layout>
      <PageHeader icon={EmailIcon} title="비밀번호 찾기" iconColor='#808080' />
      <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
        비밀번호를 재설정할 수 있는 링크를 받으려면 이메일 주소를 입력하세요.
      </Typography>
      <TextField
        fullWidth
        label="이메일"
        variant="outlined"
        margin="normal"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
      />
      <Button
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        sx={{ mt: 2, fontWeight: 700 }}
        onClick={handleSubmit}
      >
        비밀번호 찾기
      </Button>
      {message && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          {message}
        </Typography>
      )}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button onClick={() => navigate('/login')} color="secondary">
          로그인 페이지로 돌아가기
        </Button>
      </Box>
    </Layout>
  );
} 