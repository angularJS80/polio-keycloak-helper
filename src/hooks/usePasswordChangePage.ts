import { useState } from 'react';
import { fastAuthApiRequest } from 'fast-auth-with-keycloak';
import { getPasswordChangeEndpoint } from 'fast-auth-with-keycloak/config';
import { validateToken, validatePassword, validateEndpoint } from '../utils/requestValidators';
import { handlePasswordChangeSuccess, handleApiError, resetFormState } from '../utils/apiResponseHandler';

export function usePasswordChangePage(showSuccess?: (msg: string) => void, showError?: (msg: string) => void) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (showSuccess) showSuccess('');
    if (showError) showError('');
    setLoading(true);

    // 토큰 유효성 검사
    const tokenValidation = validateToken();
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
    const endpointValidation = validateEndpoint('passwordChange');
    if (!endpointValidation.isValid) {
      if (showError) showError(endpointValidation.error!);
      setLoading(false);
      return;
    }

    try {
      await fastAuthApiRequest(getPasswordChangeEndpoint(), {
        method: 'PUT',
        body: {
          newPassword: newPassword,
        },
      });

      handlePasswordChangeSuccess({ showSuccess, resetForm: () => resetFormState([setNewPassword, setConfirmNewPassword]) });
    } catch (err: any) {
      handleApiError(err, { showError, setLoading }, '비밀번호 변경 실패');
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