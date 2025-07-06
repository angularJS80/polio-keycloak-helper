import { useState } from 'react';
import { fastAuthApiRequest } from 'fast-auth-with-keycloak';
import { getPasswordChangeEndpoint } from 'fast-auth-with-keycloak/config';

import { validatePassword } from '../utils/uiUtils';
import { handleApiSuccess, handleApiError } from '../utils/apiResponseHandler';
import { resetFormState } from '../utils/uiUtils';

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
      await fastAuthApiRequest(getPasswordChangeEndpoint(), {
        method: 'PUT',
        body: {
          newPassword: newPassword,
        },
        endpointType: 'passwordChange',
      });

      handleApiSuccess({ showSuccess, setLoading, resetForm: () => resetFormState([setNewPassword, setConfirmNewPassword]) }, '비밀번호가 성공적으로 변경되었습니다!');
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