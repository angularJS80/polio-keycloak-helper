import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FastAuthProvider } from 'fast-auth-with-keycloak';
import { validatePassword } from '../utils/uiUtils';
import { handleApiSuccess, handleApiError } from '../utils/apiResponseHandler';
import { LOGIN_PATH } from '../utils/uiUtils';

export function useResetPasswordPage(showSuccess?: (msg: string) => void, showError?: (msg: string) => void) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleResetPassword = async (
    successMessage: string = '변경에 성공했습니다!', // 기본값 설정
    failureMessage: string = '변경에 실패했습니다!'  // 기본값 설정
  ) => {
    setLoading(true);

    const queryParams = new URLSearchParams(location.search);
    const urlAccessToken = queryParams.get('access_token');

    // 비밀번호 유효성 검사
    const passwordValidation = validatePassword(newPassword, confirmNewPassword);
    if (!passwordValidation.isValid) {
      if (showError) showError(passwordValidation.error!);
      setLoading(false);
      return;
    }

    try {
      // FastAuthProvider.resetPassword 사용 (내부에서 validateUrlToken 수행)
      await FastAuthProvider.resetPassword(urlAccessToken!, newPassword);
      handleApiSuccess({ showSuccess, setLoading, /* resetForm */ }, successMessage);
    } catch (err: any) {
    
      handleApiError(err, { showError, setLoading }, err.message || failureMessage); // err.message를 직접 전달
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate(LOGIN_PATH);
  };

  return {
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    handleResetPassword,
    loading,
    handleGoToLogin,
  };
} 