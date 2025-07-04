import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FastAuthProvider, fastAuthApiRequest } from 'fast-auth-with-keycloak';
import { hasAccessToken } from 'fast-auth-with-keycloak/token';
import { getConfig, getProfileConfig, getRedirectConfig, getJoinEndpoint } from 'fast-auth-with-keycloak/config';

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
      await FastAuthProvider.login({ username: loginState.username, password: loginState.password });
      const { profileAfterLogin, profileEndpoint } = getProfileConfig();
      if (profileAfterLogin) {
        const user = await fastAuthApiRequest(profileEndpoint);
        sessionStorage.setItem('fast-auth-username', user.username);
      }
      const { redirectAfterLogin, redirectPath } = getRedirectConfig();
      if (redirectAfterLogin && redirectPath) {
        navigate(redirectPath);
      }
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