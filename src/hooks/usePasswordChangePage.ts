import { useState } from 'react';
import { fastAuthApiRequest } from 'fast-auth-with-keycloak';
import { hasAccessToken } from 'fast-auth-with-keycloak/token';
import { getPasswordChangeEndpoint, hasPasswordChangeEndpoint } from 'fast-auth-with-keycloak/config';

export function usePasswordChangePage(showSuccess?: (msg: string) => void, showError?: (msg: string) => void) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (showSuccess) showSuccess('');
    if (showError) showError('');
    setLoading(true);

    if (!hasAccessToken()) {
      if (showError) showError('로그인 상태가 아닙니다. 다시 로그인 해주세요.');
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

    if (!hasPasswordChangeEndpoint()) {
      if (showError) showError('비밀번호 변경 엔드포인트가 초기화 설정에 설정되지 않았습니다. 초기화면에서 설정해주세요.');
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

      if (showSuccess) showSuccess('비밀번호가 성공적으로 변경되었습니다!');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (showError) showError(`네트워크 오류 또는 서버 응답 없음: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    handleSubmit,
    loading,
  };
} 