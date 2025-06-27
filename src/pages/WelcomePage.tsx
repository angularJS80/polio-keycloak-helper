import React, { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Confetti from 'react-confetti';
import ReactCanvasConfetti from 'react-canvas-confetti';

export default function WelcomePage() {
  const username = sessionStorage.getItem('fast-auth-username');
  const refAnimationInstance = useRef<any>(null);

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
    // eslint-disable-next-line
  }, []);

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', my: 5, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2, position: 'relative', overflow: 'hidden' }}>
      <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={120} recycle={false} />
      <ReactCanvasConfetti ref={refAnimationInstance} style={{ position: 'fixed', pointerEvents: 'none', width: '100vw', height: '100vh', top: 0, left: 0 }} />
      <Typography variant="h4" sx={{ fontWeight: 700, zIndex: 2, position: 'relative' }}>
        환영합니다{username ? `, ${username}` : ''}님!
      </Typography>
    </Box>
  );
} 