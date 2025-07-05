import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getConfig, getPasswordResetEndpoint } from 'fast-auth-with-keycloak/config';
import { validateUrlToken, validatePassword, validateEndpoint } from '../utils/requestValidators';
import { handlePasswordResetSuccess, handleApiError, handleHttpError, resetFormState } from '../utils/apiResponseHandler';
import { LOGIN_PATH } from '../utils/constants';

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

    // URL 토큰 유효성 검사
    const tokenValidation = validateUrlToken(urlAccessToken);
    if (!tokenValidation.isValid) {
      if (showError) showError(tokenValidation.error!);
      setLoading(false);
      return;
    }

    // 비밀번호 유효성 검사
    const passwordValidation = validatePassword(newPassword, confirmNewPassword);
    if (!passwordValidation.isValid) {
      if (showError) showError(passwordValidation.error!);
      setLoading(false);
      return;
    }

    // 엔드포인트 유효성 검사
    const endpointValidation = validateEndpoint('passwordReset');
    if (!endpointValidation.isValid) {
      if (showError) showError(endpointValidation.error!);
      setLoading(false);
      return;
    }

    const initConfig = getConfig();
    try {
      const response = await fetch(
        `${initConfig.baseUrl}${getPasswordResetEndpoint()}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${urlAccessToken}`,
          },
          body: JSON.stringify({ newPassword: newPassword }),
        }
      );

      if (response.ok) {
        handlePasswordResetSuccess({ 
          showSuccess, 
          resetForm: () => resetFormState([setNewPassword, setConfirmNewPassword]) 
        });
      } else {
        await handleHttpError(response, { showError, setLoading }, '비밀번호 초기화 실패');
      }
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