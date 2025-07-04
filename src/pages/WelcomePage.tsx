import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Confetti from 'react-confetti';
import ReactCanvasConfetti from 'react-canvas-confetti';
import Button from '@mui/material/Button';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Stack from '@mui/material/Stack';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { Rocket } from '@mui/icons-material';
import CircularProgress from '@mui/material/CircularProgress';
import { useWelcomePage } from '../hooks/useWelcomePage';

export default function WelcomePage() {
  const {
    displayName,
    loading,
    refAnimationInstance,
    handleLogout,
    handleGoToProfile,
    hasAccessToken,
  } = useWelcomePage();

  return (
    <Layout>
      {hasAccessToken() && (
        <>
          <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 3 }}>
            <Button
              onClick={handleLogout}
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
              {loading ? <CircularProgress size={24} color="inherit" /> : <ExitToAppIcon
                sx={{
                  fontSize: 40,
                  color: 'white',
                  display: 'block',
                  opacity: 1
                }}
              />}
            </Button>
          </Box>
          <Box sx={{ position: 'absolute', top: 16, left: 16, zIndex: 3 }}>
            <Button
              onClick={handleGoToProfile}
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
      <Confetti width={window.innerWidth} height={window.innerHeight} numberOfPieces={120} recycle={false} />
      <ReactCanvasConfetti ref={refAnimationInstance} style={{ position: 'fixed', pointerEvents: 'none', width: '100vw', height: '100vh', top: 0, left: 0 }} />

      <Stack direction="row" spacing={2} alignItems="center">
        <PageHeader icon={Rocket} title={`환영합니다${displayName ? `, ${displayName}` : ''}님!`} iconColor='#DAA520' />
      </Stack>

          <Stack direction="row" spacing={2} sx={{ mt: 3, zIndex: 2, position: 'relative' }}>
            {/* 추가 버튼/컨텐츠 필요시 여기에 */}
          </Stack>
        </>
      )}
    </Layout>
  );
} 