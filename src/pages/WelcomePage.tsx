import React, { useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Confetti from 'react-confetti';
import ReactCanvasConfetti from 'react-canvas-confetti';
import Button from '@mui/material/Button';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import { FastAuthProvider } from 'fast-auth-with-keycloak';
import { getAccessToken, decodeToken } from 'fast-auth-with-keycloak/token';
import { useNavigate } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { Rocket } from '@mui/icons-material';

export default function WelcomePage() {
  const [displayName, setDisplayName] = useState<string | null>(null);
  const refAnimationInstance = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    try {
      await FastAuthProvider.logout();
    } finally {
      setLoading(false);
    }
  };

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

    const token = getAccessToken();
    if (token) {
      try {
        const decoded = decodeToken(token);
        if (decoded && decoded.preferred_username) {
          setDisplayName(decoded.preferred_username);
        } else if (decoded && decoded.username) {
          setDisplayName(decoded.username);
        } else {
          setDisplayName('알 수 없는 사용자');
        }
      } catch (error) {
        console.error("토큰 파싱 오류:", error);
        setDisplayName('알 수 없는 사용자');
      }
    } else {
      setDisplayName('게스트');
    }
    // eslint-disable-next-line
  }, []);

  return (
    <Layout>
      <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={120} recycle={false} />
      <ReactCanvasConfetti ref={refAnimationInstance} style={{ position: 'fixed', pointerEvents: 'none', width: '100vw', height: '100vh', top: 0, left: 0 }} />
      
      <PageHeader icon={Rocket} title={`환영합니다${displayName ? `, ${displayName}` : ''}님!`} iconColor='#DAA520' />

      {getAccessToken() && (
        <>
          <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 3 }}>
            <Button
              onClick={() => navigate('/profile')}
              variant="contained"
              sx={{
                minWidth: 40,
                width: 40,
                height: 40,
                padding: 0,
                borderRadius: 2,
                bgcolor: '#5f4b8b',
              }}
            >
              <AccountCircleIcon 
                sx={{
                  fontSize: 40, 
                  color: 'white',
                  display: 'block',
                  opacity: 1
                }}
              />
            </Button>
          </Box>

          <Stack direction="row" spacing={2} sx={{ mt: 3, zIndex: 2, position: 'relative' }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleLogout}
              startIcon={<ExitToAppIcon />}
              disabled={loading}
            >
              {loading ? '로그아웃 중...' : '로그아웃'}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate('/password-change')}
              startIcon={<VpnKeyIcon />}
              disabled={loading}
            >
              비밀번호 변경
            </Button>
          </Stack>
        </>
      )}
    </Layout>
  );
} 