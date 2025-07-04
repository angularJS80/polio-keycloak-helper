import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getConfig, getPasswordResetEndpoint, hasPasswordResetEndpoint } from 'fast-auth-with-keycloak/config';

export function useResetPasswordPage(showSuccess?: (msg: string) => void, showError?: (msg: string) => void) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (showSuccess) showSuccess('');
    if (showError) showError('');
    setLoading(true);

    const queryParams = new URLSearchParams(location.search);
    const urlAccessToken = queryParams.get('access_token');

    if (!urlAccessToken) {
      if (showError) showError('유효한 접근 토큰이 없습니다.');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      if (showError) showError('새 비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) { 
      if (showError) showError('새 비밀번호는 최소 6자 이상이어야 합니다.');
      setLoading(false);
      return;
    }

    const initConfig = getConfig();
    if (!hasPasswordResetEndpoint()) {
      if (showError) showError('비밀번호 초기화 엔드포인트가 초기화 설정에 설정되지 않았습니다. 초기화면에서 설정해주세요.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${initConfig.baseUrl}${getPasswordResetEndpoint()}`,
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
        if (showSuccess) showSuccess('비밀번호가 성공적으로 변경되었습니다!');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        const errorData = await response.json();
        if (showError) showError(`비밀번호 초기화 실패: ${errorData.message || '알 수 없는 오류'}`);
      }
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (showError) showError(`비밀번호 초기화 실패: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return {
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    handleSubmit,
    loading,
    handleGoToLogin,
  };
} 