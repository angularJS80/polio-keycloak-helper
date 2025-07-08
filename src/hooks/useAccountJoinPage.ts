import { useState } from 'react';
import { validatePassword, validateEmail, validateUsername, validateMultiple } from '../utils/uiUtils';
import { handleApiSuccess, handleApiError } from '../utils/apiResponseHandler';
import { FastAuthProvider } from 'fast-auth-with-keycloak';

export function useAccountJoinPage(showSuccess?: (msg: string) => void, showError?: (msg: string) => void) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin =async (
    successMessage: string = '등록에 성공했습니다!', // 기본값 설정
    failureMessage: string = '등록에 실패했습니다!'  // 기본값 설정
  ) => {
    setLoading(true);

    // 복합 유효성 검사
    const validation = validateMultiple([
      validateUsername(username),
      validateEmail(email),
      validatePassword(password, confirmPassword)
    ]);
    
    if (!validation.isValid) {
      if (showError) showError(validation.error!);
      setLoading(false);
      return;
    }

    try {
      // 변경된 부분: FastAuthProvider.accountJoin 함수 사용
      // 실제 hook에서 사용되는 데이터 구조에 맞춰 params 객체를 구성해야 합니다.
      await FastAuthProvider.join({
        username: username, // 예시: 실제 hook의 상태 변수에 따라 변경
        email: email,       // 예시: 실제 hook의 상태 변수에 따라 변경
        password: password, // 예시: 실제 hook의 상태 변수에 따라 변경
        // 기타 필요한 필드들 (예: confirmPassword는 백엔드로 보내지 않을 수 있음)
      });
      
      handleApiSuccess({ showSuccess, setLoading, /* resetForm */ }, successMessage);
    } catch (err: any) {
    
      handleApiError(err, { showError, setLoading }, err.message || failureMessage); // err.message를 직접 전달
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
    handleJoin,
    loading,
  };
} 