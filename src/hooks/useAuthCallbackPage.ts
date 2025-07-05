import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FastAuthProvider } from 'fast-auth-with-keycloak';
import { validateAuthCode } from '../utils/requestValidators';
import { handleLoginSuccess, handleApiError } from '../utils/apiResponseHandler';
import { LOGIN_PATH } from '../utils/constants';

export function useAuthCallbackPage() {
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
        await handleLoginSuccess(response, { 
          showSuccess: () => setMessage('로그인 성공!'),
          navigate 
        });
      } catch (err: any) {
        handleApiError(err, { 
          showError: (msg) => setError(msg), 
          setLoading: () => {} 
        }, '코드 로그인 처리 중 오류가 발생했습니다.');
        setMessage('로그인 실패');
      }
    };

    processAuthCallback();
  }, [location.search, navigate]);

  return {
    message,
    error,
    handleCloseError,
  };
} 