import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FastAuthProvider } from 'fast-auth-with-keycloak';
import { validatePassword } from '../utils/uiUtils';
import { handleApiSuccess, handleApiError } from '../utils/apiResponseHandler';
import { resetFormState } from '../utils/uiUtils';
import { LOGIN_PATH } from '../utils/uiUtils';

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
      handleApiSuccess({ 
        showSuccess, 
        resetForm: () => resetFormState([setNewPassword, setConfirmNewPassword]) 
      }, '비밀번호가 성공적으로 변경되었습니다!');
    } catch (err: any) {
      handleApiError(err, { showError, setLoading }, '비밀번호 초기화 실패');
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
    handleSubmit,
    loading,
    handleGoToLogin,
  };
} 