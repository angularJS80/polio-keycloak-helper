import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FastAuthProvider, validateAuthCode } from 'fast-auth-with-keycloak';
import { getRedirectConfig } from 'fast-auth-with-keycloak/config';
import { handleApiSuccess, handleApiError } from '../utils/apiResponseHandler';
import { DEFAULT_REDIRECT_PATH, LOGIN_PATH } from '../utils/uiUtils';

export function useLoginByOauthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [message, setMessage] = useState('로그인 처리 중...');
  const [error, setError] = useState<string | null>(null);
  const isApiCallMade = useRef(false);

  const handleCloseError = () => {
    setError(null);
    navigate(LOGIN_PATH);
  };

  useEffect(() => {
    if (isApiCallMade.current) {
      return;
    }

    processAuthCallback();
  }, [location.search, navigate]);

  const processAuthCallback = async () => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('code');

    // 인증 코드 유효성 검사
    const codeValidation = validateAuthCode(code);
    if (!codeValidation.isValid) {
      setError(codeValidation.error!);
      setMessage('로그인 실패');
      return;
    }
    isApiCallMade.current = true;

    try {
      // FastAuthProvider.loginByCode 사용
      const response = await FastAuthProvider.loginByCode(code!);
      
      // handleApiSuccess 재사용
      handleApiSuccess({ 
        showSuccess: () => setMessage('로그인 성공!')
      }, '로그인 성공!');

      // FastAuthProvider.loginByCode에서 이미 토큰이 설정되었으므로 세션만 재개
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
        showError: (msg) => setError(msg), 
        setLoading: () => {} 
      }, '코드 로그인 처리 중 오류가 발생했습니다.');
      setMessage('로그인 실패');
    }
  };

  return {
    message,
    error,
    handleCloseError,
  };
} 