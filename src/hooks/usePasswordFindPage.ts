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

  const handleFindPassword =async (
    successMessage: string = '전송에 성공했습니다!', // 기본값 설정
    failureMessage: string = '전송에 실패했습니다!'  // 기본값 설정
  ) => {
    setLoading(true);

    try {
      // 변경된 부분: FastAuthProvider.findPassword 함수 사용
      await FastAuthProvider.findPassword({
        email: email
      });

      handleApiSuccess({ showSuccess, setLoading, /* resetForm */ }, successMessage);
    } catch (err: any) {
    
      handleApiError(err, { showError, setLoading }, err.message || failureMessage); // err.message를 직접 전달
    } finally {
      setLoading(false);
    }
   
  };

  return {
    email,
    setEmail,
    handleFindPassword,
    loading,
  };
} 