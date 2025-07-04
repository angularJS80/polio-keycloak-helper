import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import InitPage from './pages/InitPage';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import AccountJoinPage from './pages/AccountJoinPage';
import PasswordChangePage from './pages/PasswordChangePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import PasswordFindPage from './pages/PasswordFindPage';
import ProfilePage from './pages/ProfilePage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { FastAuthProvider } from 'fast-auth-with-keycloak';
import { getAccessToken, getTokenExpiration, hasAccessToken } from 'fast-auth-with-keycloak/token';
import { getAccessTokenExpiration } from 'fast-auth-with-keycloak/token';
import { getConfig } from 'fast-auth-with-keycloak/config';
import { refreshTokenIfNeeded } from 'fast-auth-with-keycloak';
import SessionExpiryDialog from './components/SessionExpiryDialog';
import { Stack } from '@mui/material';

// 초기화 설정 없이 접근 가능한 경로 목록
const PUBLIC_PATHS = [
  '/config',
  '/login',
  '/join',
  '/password-find',
  '/reset-password',
  '/auth/callback',
];

const theme = createTheme({
  palette: {
    primary: {
      main: '#5f4b8b', // Ultra Violet (버튼, 체크박스)
      contrastText: '#fff', // 버튼 텍스트 흰색
    },
    secondary: {
      main: '#5f4b8b', // Ultra Violet (필요시)
      contrastText: '#fff',
    },
    background: {
      default: '#f5f7fa', // 연회색
      paper: '#fff', // 흰색
    },
    text: {
      primary: '#20232a', // 딥그레이
      secondary: '#6c757d', // 연회색
    },
  },
  typography: {
    fontFamily: [
      'Noto Sans KR',
      'Roboto',
      'Apple SD Gothic Neo',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiCheckbox: {
      styleOverrides: {
        root: {
          '&.Mui-checked': {
            color: '#5f4b8b',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: '#fff', // 버튼 텍스트 흰색
          backgroundColor: '#5f4b8b',
          borderRadius: '12px', // 곡선 느낌
          '&:hover': {
            backgroundColor: '#4b3970',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          borderRadius: '12px', // 곡선 느낌
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: '12px', // 곡선 느낌
        },
      },
    },
  },
});

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const navigateRef = useRef(navigate);
  
  // navigate ref 업데이트
  useEffect(() => {
    navigateRef.current = navigate;
  }, [navigate]);

  const [showSessionExpiryDialog, setShowSessionExpiryDialog] = useState(false);
  const [onExtendSession, setOnExtendSession] = useState<(() => void) | null>(null);
  const [onLogoutSession, setOnLogoutSession] = useState<(() => void) | null>(null);

  // showSessionExpiryDialog state 변화 추적
  useEffect(() => {
    console.log('[App] showSessionExpiryDialog state 변경됨:', showSessionExpiryDialog);
  }, [showSessionExpiryDialog]);

  // 콜백 함수를 일반 함수로 정의 (의존성 문제 해결)
  const handleSessionExpiryAlert = (onExtend: () => void, onLogout: () => void) => {
    console.log('[App] onSessionExpiryAlert 콜백 실행 시작');
    console.log('[App] 현재 showSessionExpiryDialog 상태:', showSessionExpiryDialog);
    
    setShowSessionExpiryDialog(true);
    console.log('[App] setShowSessionExpiryDialog(true) 호출됨');
    
    setOnExtendSession(() => () => {
      console.log('[App] onExtendSession 실행');
      onExtend();
      setShowSessionExpiryDialog(false);
    });
    
    setOnLogoutSession(() => () => {
      console.log('[App] onLogoutSession 실행');
      onLogout();
      setShowSessionExpiryDialog(false);
    });
    
    console.log('[App] onSessionExpiryAlert 콜백 실행 완료');
  };

  // FastAuthProvider 초기화 - 한 번만 실행
  useEffect(() => {
    console.log('[App] FastAuthProvider 초기화 시작');
    const parsedConfig = getConfig();
    
    FastAuthProvider.init({
      ...parsedConfig,
      onTokenExpiredNavigate: (path: string) => navigateRef.current(path), // ref 사용
      onSessionExpiryAlert: handleSessionExpiryAlert,
    });
    console.log('[App] FastAuthProvider 초기화 완료');
  }, []); // 빈 의존성 배열로 한 번만 실행

  // 경로별 처리 - 별도 useEffect로 분리
  useEffect(() => {
    const currentPath = location.pathname;
    console.log("location.pathname: " + currentPath);

    // 공개 경로가 아니거나 루트 경로인 경우에만 인증 체크
    const shouldCheckAuth = !PUBLIC_PATHS.includes(currentPath) || currentPath === '/';

    if (shouldCheckAuth) {
      // 루트 경로일 경우에만 토큰 확인 후 리다이렉트
      if (currentPath === '/') {
        if (!hasAccessToken()) {
          navigate('/login', { replace: true });
        } else {
          const token = getAccessToken() as string;
          const exp = getAccessTokenExpiration();

          if (!exp || Date.now() > exp) {
            navigate('/login', { replace: true });
          } else {
            navigate('/welcome', { replace: true });
          }
        }
      }
    }
  }, [location.pathname, navigate]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={<div>Loading...</div>} />
        <Route path="/config" element={<InitPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        <Route path="/join" element={<AccountJoinPage />} />
        <Route path="/password-change" element={<PasswordChangePage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/password-find" element={<PasswordFindPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        {/* 필요시 환영 페이지 등 추가 라우트 */}
      </Routes>
      {onExtendSession && onLogoutSession && (
        <SessionExpiryDialog
          open={showSessionExpiryDialog}
          onExtend={onExtendSession}
          onLogout={onLogoutSession}
        />
      )}
    </ThemeProvider>
  );
}

export default App;
