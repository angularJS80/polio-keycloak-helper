import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FastAuthProvider } from 'fast-auth-with-keycloak';
import { getRedirectConfig } from 'fast-auth-with-keycloak';
import { handleApiSuccess, handleApiError } from '../utils/apiResponseHandler';
import { validateLoginRequest } from '../utils/uiUtils';
import { DEFAULT_REDIRECT_PATH } from '../utils/uiUtils';

export function useLoginPage(showError?: (msg: string) => void) {
  const [loginState, setLoginState] = useState({ username: '', password: '', loading: false, error: '' });
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCloseAlert = () => {
    setAlertMessage(null);
  };

  const handleLogin = async (
    successMessage: string = '로그인에 성공했습니다!', // 기본값 설정
    failureMessage: string = '로그인에 실패했습니다!'  // 기본값 설정
  ) => {
    setLoading(true);
    // 로그인 요청 유효성 검사
    const loginValidation = validateLoginRequest(loginState.username, loginState.password);
    if (!loginValidation.isValid) {
      setLoginState(s => ({ ...s, error: loginValidation.error || '로그인 정보를 확인해주세요.' }));
      return;
    }

    setLoginState(s => ({ ...s, loading: true, error: '' }));
    try {
      await FastAuthProvider.login({ username: loginState.username, password: loginState.password });
      // handleApiSuccess 재사용
      handleApiSuccess({ 
        setLoading: (loading) => setLoginState(s => ({ ...s, loading }))
      }, successMessage); // 전달받은 성공 메시지 사용

      // 리다이렉트 처리
      const { redirectAfterLogin, redirectPath } = getRedirectConfig();
      if (redirectAfterLogin && redirectPath) {
        navigate(redirectPath, { replace: true });
      } else {
        navigate(DEFAULT_REDIRECT_PATH, { replace: true });
      }
    } catch (err: any) {
      handleApiError(err, { showError, setLoading }, err.message || failureMessage); // err.message를 직접 전달
    } finally {
      setLoading(false);
    }
  };


  const handleSocialLogin = async () => {
    
    const  res = await FastAuthProvider.socialLoginEndpoint();
    window.location.href  = res.url;

  };

  return {
    loginState,
    setLoginState,
    alertMessage,
    setAlertMessage,
    handleCloseAlert,
    handleLogin,
    handleSocialLogin,
    loading,
    showError
  };
} 