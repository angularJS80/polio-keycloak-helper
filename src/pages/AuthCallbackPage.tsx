import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FastAuthProvider, fastAuthApiRequest } from 'fast-auth-with-keycloak';
import { setAccessToken, setRefreshToken } from 'fast-auth-with-keycloak/token';
import { getConfig, getProfileConfig, getRedirectConfig, ensureInit} from 'fast-auth-with-keycloak/config';
import { setItem } from 'fast-auth-with-keycloak/storage';

import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import Layout from '../components/Layout';

export default function AuthCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('로그인 처리 중...');
  const [error, setError] = useState<string | null>(null);
  const isApiCallMade = useRef(false);

  useEffect(() => {
    ensureInit();
    if (isApiCallMade.current) {
      return;
    }

    const processAuthCallback = async () => {
      const queryParams = new URLSearchParams(location.search);
      const code = queryParams.get('code');
      if (!code) {
        setError('인증 코드를 찾을 수 없습니다.');
        setMessage('로그인 실패');
        return;
      }

      isApiCallMade.current = true;

      const initConfig = getConfig();

      const codeLoginEndpoint = initConfig.codeLoginEndpoint;
      const baseUrl = initConfig.baseUrl;
      if (!codeLoginEndpoint || !baseUrl) {
        setError('초기화 설정에 코드 로그인 엔드포인트 또는 Base URL이 설정되지 않았습니다. 관리자에게 문의하세요.');
        setMessage('로그인 실패');
        return;
      }

      try {
        const response = await fetch(
          `${baseUrl}${codeLoginEndpoint}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: code }),
          }
        );


        if (response.ok) {
          const data = await response.json();
          setAccessToken(data.accessToken);
          setRefreshToken(data.refreshToken);

          FastAuthProvider.resumeSession();
          const { profileAfterLogin, profileEndpoint } = getProfileConfig();
          if (profileAfterLogin) {
            try {
              const user = await fastAuthApiRequest(profileEndpoint);
              setItem('session', 'fast-auth-username', user.username);
            } catch (profileErr) {
              console.error('프로필 조회 실패:', profileErr);
            }
          }

          const { redirectAfterLogin, redirectPath } = getRedirectConfig();
          if (redirectAfterLogin && redirectPath) {
            navigate(redirectPath, { replace: true });
          } else {
            navigate('/welcome', { replace: true });
          }
          setMessage('로그인 성공!');
        } else {
          const errorData = await response.json();
          setError(errorData.message || '코드 로그인 처리 중 오류가 발생했습니다.');
          setMessage('로그인 실패');
        }
      } catch (err) {
        console.error('코드 로그인 요청 중 오류 발생:', err);
        setError('네트워크 오류 또는 서버 응답 없음.');
        setMessage('로그인 실패');
      }
    };

    processAuthCallback();
  }, [location.search, navigate]);

  return (
    <Layout>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
        {!error ? (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">{message}</Typography>
          </>
        ) : (
          <Alert severity="error">
            <Typography variant="h6">{message}</Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        )}
      </Box>
    </Layout>
  );
} 