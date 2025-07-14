import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FastAuthProvider, validateToken } from 'fast-auth-with-keycloak';
import { setConfig, getConfig, clearConfigCache } from 'fast-auth-with-keycloak';
import { LOGIN_PATH, DEFAULT_REDIRECT_PATH, CONFIG_PATH } from '../utils/uiUtils';

export function useConfigPage() {
  const [config, setConfig] = useState(getConfig());
  const navigate = useNavigate();

  // 페이지 로드 시마다 최신 설정을 다시 로드
  useEffect(() => {
    clearConfigCache();
    const latestConfig = getConfig(true);
    setConfig(latestConfig);
  }, []);

  const handleSave = () => {
    try {
      // 설정 저장
      setConfig(config);
      
      // FastAuthProvider 재초기화
      FastAuthProvider.init(config);
      
      // 네비게이션 처리
      if (validateToken().isValid) {
        const currentPath = window.location.pathname;
        if (currentPath === CONFIG_PATH) {
          navigate(DEFAULT_REDIRECT_PATH);
        } else {
          navigate(-1);
        }
      } else {
        navigate(LOGIN_PATH);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert('설정 저장 중 오류가 발생했습니다: ' + errorMessage);
    }
  };

  return {
    config,
    setConfig,
    handleSave,
  };
} 