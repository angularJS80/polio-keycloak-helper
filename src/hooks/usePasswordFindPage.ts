import { useState } from 'react';
import { fastAuthApiRequest } from 'fast-auth-with-keycloak';
import { getPasswordFindEndpoint } from 'fast-auth-with-keycloak/config';
import { validateEndpoint } from 'fast-auth-with-keycloak';

import { validateEmail } from '../utils/uiUtils';
import { handleApiSuccess, handleApiError } from '../utils/apiResponseHandler';
import { resetFormState } from '../utils/uiUtils';

export function usePasswordFindPage(showSuccess?: (msg: string) => void, showError?: (msg: string) => void) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (showSuccess) showSuccess('');
    if (showError) showError('');
    setLoading(true);

    // 이메일 유효성 검사
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      if (showError) showError(emailValidation.error!);
      setLoading(false);
      return;
    }

    // 엔드포인트 유효성 검사
    const endpointValidation = validateEndpoint('passwordFind');
    if (!endpointValidation.isValid) {
      if (showError) showError(endpointValidation.error!);
      setLoading(false);
      return;
    }

    try {
      await fastAuthApiRequest(getPasswordFindEndpoint(), {
        method: 'POST',
        body: {
          email: email,
        },
        withToken: false,
      });

      handleApiSuccess({ 
        showSuccess, 
        resetForm: () => resetFormState([setEmail]) 
      }, '비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.');
    } catch (err: any) {
      handleApiError(err, { showError, setLoading }, '비밀번호 찾기 실패');
    }
  };

  return {
    email,
    setEmail,
    loading,
    handleSubmit,
  };
} 