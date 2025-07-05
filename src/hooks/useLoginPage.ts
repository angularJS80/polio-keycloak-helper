import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FastAuthProvider } from 'fast-auth-with-keycloak';
import { hasAccessToken } from 'fast-auth-with-keycloak/token';
import { getConfig, getJoinEndpoint } from 'fast-auth-with-keycloak/config';
import { handleLoginSuccess } from '../utils/apiResponseHandler';

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
    setLoginState(s => ({ ...s, loading: true, error: '' }));
    try {
      const response = await FastAuthProvider.login({ username: loginState.username, password: loginState.password });
      await handleLoginSuccess(response, { 
        navigate,
        setLoading: (loading) => setLoginState(s => ({ ...s, loading }))
      });
    } catch (err) {
      setLoginState(s => ({ ...s, error: '로그인 실패', loading: false }));
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