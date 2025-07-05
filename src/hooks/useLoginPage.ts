import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FastAuthProvider } from 'fast-auth-with-keycloak';
import { hasAccessToken } from 'fast-auth-with-keycloak/token';
import { getConfig, getRedirectConfig } from 'fast-auth-with-keycloak/config';
import { handleApiSuccess, handleApiError } from '../utils/apiResponseHandler';
import { validateLoginRequest } from '../utils/uiUtils';
import { DEFAULT_REDIRECT_PATH } from '../utils/uiUtils';

export function useLoginPage() {
  const [loginState, setLoginState] = useState({ username: '', password: '', loading: false, error: '' });
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const initConfig = getConfig();

  useEffect(() => {
    if (hasAccessToken()) {
      try {
        FastAuthProvider.getConfig();
      } catch {}
    }
  }, []);

  const handleCloseAlert = () => {
    setAlertMessage(null);
  };

  const handleLogin = async () => {
    // 로그인 요청 유효성 검사
    const loginValidation = validateLoginRequest(loginState.username, loginState.password);
    if (!loginValidation.isValid) {
      setLoginState(s => ({ ...s, error: loginValidation.error || '로그인 정보를 확인해주세요.' }));
      return;
    }

    setLoginState(s => ({ ...s, loading: true, error: '' }));
    try {
      const response = await FastAuthProvider.login({ username: loginState.username, password: loginState.password });
      // handleApiSuccess 재사용
      handleApiSuccess({ 
        setLoading: (loading) => setLoginState(s => ({ ...s, loading }))
      }, '로그인 성공!');

      // FastAuthProvider.login에서 이미 토큰이 설정되었으므로 세션만 재개
      FastAuthProvider.resumeSession();
      
      // 리다이렉트 처리
      const { redirectAfterLogin, redirectPath } = getRedirectConfig();
      if (redirectAfterLogin && redirectPath) {
        navigate(redirectPath, { replace: true });
      } else {
        navigate(DEFAULT_REDIRECT_PATH, { replace: true });
      }
    } catch (err: any) {
      handleApiError(err, { 
        showError: (msg) => setLoginState(s => ({ ...s, error: msg, loading: false })), 
        setLoading: (loading) => setLoginState(s => ({ ...s, loading }))
      }, '로그인 실패');
    }
  };


  const handleSocialLogin = () => {
    if (initConfig.socialLoginEndpoint) {
      const socialLoginUrl = initConfig.socialLoginEndpoint.startsWith('http://') || initConfig.socialLoginEndpoint.startsWith('https://')
        ? initConfig.socialLoginEndpoint
        : `${initConfig.baseUrl}${initConfig.socialLoginEndpoint}`;
      window.location.href = socialLoginUrl;
    }
  };

  return {
    loginState,
    setLoginState,
    alertMessage,
    setAlertMessage,
    handleCloseAlert,
    handleLogin,
    handleSocialLogin,
    initConfig,
  };
} 