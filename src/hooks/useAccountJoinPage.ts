import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fastAuthApiRequest } from 'fast-auth-with-keycloak';
import { getJoinEndpoint } from 'fast-auth-with-keycloak/config';

export function useAccountJoinPage() {
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

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    message,
    handleCloseMessage,
    handleSubmit,
    loading,
    handleGoToLogin,
  };
} 