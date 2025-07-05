import { useState } from 'react';
import { fastAuthApiRequest } from 'fast-auth-with-keycloak';
import { getJoinEndpoint } from 'fast-auth-with-keycloak/config';
import { validatePassword, validateEmail, validateUsername, validateEndpoint, validateMultiple } from '../utils/requestValidators';
import { handleJoinSuccess, handleApiError, handleHttpError, resetFormState } from '../utils/apiResponseHandler';

export function useAccountJoinPage(showSuccess?: (msg: string) => void, showError?: (msg: string) => void) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (showSuccess) showSuccess('');
    if (showError) showError('');
    setLoading(true);

    // 복합 유효성 검사
    const validation = validateMultiple([
      validateUsername(username),
      validateEmail(email),
      validatePassword(password, confirmPassword),
      validateEndpoint('join')
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
      });

      if (response.ok) {
        handleJoinSuccess({ 
          showSuccess, 
          resetForm: () => resetFormState([setUsername, setEmail, setPassword, setConfirmPassword]) 
        });
      } else {
        await handleHttpError(response, { showError, setLoading }, '계정 등록 실패');
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