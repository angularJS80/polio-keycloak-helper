import { useState } from 'react';
import { fastAuthApiRequest } from 'fast-auth-with-keycloak';
import { getJoinEndpoint } from 'fast-auth-with-keycloak/config';


import { validatePassword, validateEmail, validateUsername, validateMultiple } from '../utils/uiUtils';
import { handleApiSuccess, handleApiError } from '../utils/apiResponseHandler';
import { resetFormState } from '../utils/uiUtils';

export function useAccountJoinPage(showSuccess?: (msg: string) => void, showError?: (msg: string) => void) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
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
      const response = await fastAuthApiRequest(getJoinEndpoint(), {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
        withToken: false,
        endpointType: 'join',
      });

      if (response.ok) {
        handleApiSuccess({ 
          showSuccess, 
          resetForm: () => resetFormState([setUsername, setEmail, setPassword, setConfirmPassword]) 
        }, '계정 등록이 성공적으로 완료되었습니다!');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || response.statusText || '계정 등록 실패';
        handleApiError(new Error(errorMessage), { showError, setLoading }, '계정 등록 실패');
      }
    } catch (err: any) {
      handleApiError(err, { showError, setLoading }, '계정 등록 실패');
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
    handleSubmit,
    loading,
  };
} 