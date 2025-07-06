import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FastAuthProvider, addDialogStateListener, removeDialogStateListener, validateToken } from 'fast-auth-with-keycloak';
import {  isTokenExpired, hasAccessToken } from 'fast-auth-with-keycloak/token';
import { getConfig } from 'fast-auth-with-keycloak/config';
import { PUBLIC_PATHS, LOGIN_PATH, DEFAULT_REDIRECT_PATH } from '../utils/uiUtils';

export function useAppCore() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigateRef = useRef(navigate);
  
  // navigate ref 업데이트
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  // 전역 상태에서 다이얼로그 상태 가져오기
  const [dialogState, setDialogState] = useState({ show: false, onExtend: null, onLogout: null });
  
  const updateDialogState = (state: any) => {
    setDialogState(state);
  };

  const isNeedAuthPath = (path: any) =>{
    return !isPublicPaths(path);
  }

  const isPublicPaths = (path: any) =>{
    return PUBLIC_PATHS.includes(path) || path === '/';
  }

  // 다이얼로그 상태 변경 감지
  useEffect(() => {
    // 이벤트 리스너 등록
    addDialogStateListener(updateDialogState);

    return () => {
      removeDialogStateListener(updateDialogState);
    };
  }, []);

  // FastAuthProvider 초기화 - 한 번만 실행
  useEffect(() => {
    console.log('[App] FastAuthProvider 초기화 시작');
    const parsedConfig = getConfig();
    
    FastAuthProvider.init({
      ...parsedConfig,
      onTokenExpiredNavigate: (path: string) => navigateRef.current(path), // ref 사용
      // onSessionExpiryAlert 제거 - 더 이상 필요 없음
    });
    console.log('[App] FastAuthProvider 초기화 완료');
  }, []); // 빈 의존성 배열로 한 번만 실행

  // 경로별 처리 - 별도 useEffect로 분리
  useEffect(() => {
    const currentPath = location.pathname;
    console.log("location.pathname: " + currentPath);

    const { isValid } = validateToken();

    if (currentPath === '/') {
      if(isValid){
        navigate(DEFAULT_REDIRECT_PATH, { replace: true });
      }else{
        navigate(LOGIN_PATH, { replace: true });
      }
    }

    if (isPublicPaths(currentPath)) return;
    if (!isValid) {
      navigate(LOGIN_PATH, { replace: true });
      return;
    }

    
  }, [location.pathname, navigate]);

  return { dialogState };
} 