import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FastAuthProvider } from 'fast-auth-with-keycloak';
import { hasAccessToken } from 'fast-auth-with-keycloak/token';
import { getConfig, clearConfigCache } from 'fast-auth-with-keycloak/config';
import { setItem } from 'fast-auth-with-keycloak/storage';

export function useInitPage() {
  const [initConfig, setInitConfig] = useState(getConfig());
  const navigate = useNavigate();

  // 페이지 로드 시마다 최신 설정을 다시 로드
  useEffect(() => {
    clearConfigCache();
    const latestConfig = getConfig(true);
    setInitConfig(latestConfig);
  }, []);

  const handleSave = () => {
    try {
      setItem('local', 'fast-auth-init-config', JSON.stringify(initConfig));
      if (hasAccessToken()) {
        FastAuthProvider.reinit(initConfig);
      } else {
        FastAuthProvider.init(initConfig);
      }
      if (hasAccessToken()) {
        const currentPath = window.location.pathname;
        if (currentPath === '/config') {
          navigate('/welcome');
        } else {
          navigate(-1);
        }
      } else {
        navigate('/login');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      alert('설정 저장 중 오류가 발생했습니다: ' + errorMessage);
    }
  };

  return {
    initConfig,
    setInitConfig,
    handleSave,
  };
} 