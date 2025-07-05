import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FastAuthProvider } from 'fast-auth-with-keycloak';
import { getUserName, hasAccessToken } from 'fast-auth-with-keycloak/token';
import { LOGIN_PATH } from '../utils/uiUtils';

export function useWelcomePage() {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const refAnimationInstance = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 빵빠레(파티팝) 애니메이션 함수
  function makeShot(particleRatio: number, opts: any) {
    if (refAnimationInstance.current) {
      refAnimationInstance.current({
        ...opts,
        origin: { y: 0.7 },
        particleCount: Math.floor(200 * particleRatio),
      });
    }
  }
  function fireConfetti() {
    makeShot(0.25, {
      spread: 26,
      startVelocity: 55,
    });
    makeShot(0.2, {
      spread: 60,
    });
    makeShot(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });
    makeShot(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });
    makeShot(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }

  useEffect(() => {
    fireConfetti();
    if (hasAccessToken()) {
      try {
        const userName = getUserName();
        setDisplayName(userName || '알 수 없는 사용자');
      } catch (error) {
        setDisplayName('알 수 없는 사용자');
      }
    } else {
      setDisplayName('게스트');
    }
    // eslint-disable-next-line
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await FastAuthProvider.logout();
    } finally {
      setLoading(false);
    }
  };

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  const handleGoToLogin = () => {
    navigate(LOGIN_PATH);
  };

  return {
    displayName,
    loading,
    refAnimationInstance,
    handleLogout,
    handleGoToProfile,
    handleGoToLogin,
    hasAccessToken,
  };
} 