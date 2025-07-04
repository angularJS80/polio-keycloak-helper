import { useState } from 'react';
import { fastAuthApiRequest } from 'fast-auth-with-keycloak';
import { getPasswordFindEndpoint, hasPasswordFindEndpoint } from 'fast-auth-with-keycloak/config';

export function usePasswordFindPage(showSuccess?: (msg: string) => void, showError?: (msg: string) => void) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (showSuccess) showSuccess('');
    if (showError) showError('');
    setLoading(true);

    if (!hasPasswordFindEndpoint()) {
      if (showError) showError('비밀번호 찾기 엔드포인트가 초기화 설정에 설정되지 않았습니다. 초기화면에서 설정해주세요.');
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

      if (showSuccess) showSuccess('비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.');
      setEmail('');
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (showError) showError(`비밀번호 찾기 실패: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    loading,
    handleSubmit,
  };
} 