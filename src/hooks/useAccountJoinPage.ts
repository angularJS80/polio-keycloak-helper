import { useState } from 'react';
import { fastAuthApiRequest } from 'fast-auth-with-keycloak';
import { getJoinEndpoint } from 'fast-auth-with-keycloak/config';

export function useAccountJoinPage(showSuccess?: (msg: string) => void, showError?: (msg: string) => void) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (showSuccess) showSuccess('');
    if (showError) showError('');
    setLoading(true);

    if (password !== confirmPassword) {
      if (showError) showError('비밀번호가 일치하지 않습니다.');
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
        if (showSuccess) showSuccess('계정 등록이 성공적으로 완료되었습니다!');
      } else {
        const errorData = await response.json();
        if (showError) showError(`계정 등록 실패: ${errorData.message || response.statusText}`);
      }
    } catch (err: any) {
      if (showError) showError(`네트워크 오류 또는 서버 응답 없음: ${err.message}`);
    } finally {
      setLoading(false);
    }
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
    handleSubmit,
    loading,
  };
} 