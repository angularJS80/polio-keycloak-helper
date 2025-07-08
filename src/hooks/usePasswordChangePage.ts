import { useState } from 'react';

import { validatePassword } from '../utils/uiUtils';
import { handleApiSuccess, handleApiError } from '../utils/apiResponseHandler';
import { FastAuthProvider } from 'fast-auth-with-keycloak';

export function usePasswordChangePage(showSuccess?: (msg: string) => void, showError?: (msg: string) => void) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword =  async (
    successMessage: string = '등록에 성공했습니다!', // 기본값 설정
    failureMessage: string = '등록에 실패했습니다!'  // 기본값 설정
  ) => {
    

    setLoading(true);
    
    // 비밀번호 유효성 검사
    const passwordValidation = validatePassword(newPassword, confirmNewPassword);
    if (!passwordValidation.isValid) {
      if (showError) showError(passwordValidation.error!);
      setLoading(false);
      return;
    }
    try {
      // 변경된 부분: FastAuthProvider.changePassword 함수 사용
      await FastAuthProvider.changePassword(newPassword);

      
      handleApiSuccess({ showSuccess, setLoading, /* resetForm */ }, successMessage);
    } catch (err: any) {
      handleApiError(err, { showError, setLoading }, err.message || failureMessage); // err.message를 직접 전달
    } finally {
      setLoading(false);
    }
  };

  return {
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    handleChangePassword,
    loading,
  };
} 