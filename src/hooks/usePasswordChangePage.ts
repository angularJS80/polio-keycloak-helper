import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fastAuthApiRequest } from 'fast-auth-with-keycloak';
import { hasAccessToken } from 'fast-auth-with-keycloak/token';
import { getPasswordChangeEndpoint, hasPasswordChangeEndpoint } from 'fast-auth-with-keycloak/config';

export function usePasswordChangePage() {
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

      setMessage({ type: 'success', text: '비밀번호가 성공적으로 변경되었습니다!' });
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setMessage({ type: 'error', text: `네트워크 오류 또는 서버 응답 없음: ${errorMessage}` });
    } finally {
      setLoading(false);
    }
  };

  const handleGoToWelcome = () => {
    navigate('/welcome');
  };

  return {
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    message,
    handleCloseMessage,
    handleSubmit,
    loading,
    handleGoToWelcome,
  };
} 