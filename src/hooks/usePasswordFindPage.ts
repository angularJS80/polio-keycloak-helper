import { useState } from 'react';
import {
  FastAuthProvider
} from 'fast-auth-with-keycloak'; // FastAuthProvider 임포트 경로 확인
import {
  handleApiError,
  handleApiSuccess
} from '../utils/apiResponseHandler';

export function usePasswordFindPage(showSuccess?: (msg: string) => void, showError?: (msg: string) => void) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      // 변경된 부분: FastAuthProvider.findPassword 함수 사용
      await FastAuthProvider.findPassword({
        email: email
      });

      handleApiSuccess({ showSuccess, setLoading, /* resetForm */ }, '초기화 메일 전송이 완료되었습니다!');
      // 회원가입 성공 후 리다이렉트 로직 등
      // navigate('/login');
    } catch (err: any) {
      // 변경된 부분: alert(err) 대신 err.message 사용, showError에 err.message 전달
      // alert(err); // 이제 이 부분 대신 showError를 주로 사용
      handleApiError(err, { showError, setLoading }, err.message || '알 수 없는 초기화 메일전송  실패'); // err.message를 직접 전달
    } finally {
      setLoading(false);
    }
   
  };

  return {
    email,
    setEmail,
    handleSubmit,
    loading,
  };
} 