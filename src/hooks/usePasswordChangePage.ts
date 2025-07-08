import { useState } from 'react';

import { validatePassword } from '../utils/uiUtils';
import { handleApiSuccess, handleApiError } from '../utils/apiResponseHandler';
import { resetFormState } from '../utils/uiUtils';
import { FastAuthProvider } from 'fast-auth-with-keycloak';

export function usePasswordChangePage(showSuccess?: (msg: string) => void, showError?: (msg: string) => void) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {


    event.preventDefault();
    

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

      handleApiSuccess({
        showSuccess,
        setLoading,
        resetForm: () => resetFormState([setNewPassword, setConfirmNewPassword])
      }, '비밀번호가 성공적으로 변경되었습니다!');
    } catch (err: any) {
      handleApiError(err, {
        showError,
        setLoading
      }, '비밀번호 변경 실패');
    } finally {
      setLoading(false); // 로딩 상태를 항상 해제하도록 추가
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