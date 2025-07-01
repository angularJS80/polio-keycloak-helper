import React, { useEffect } from 'react';
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
import { getAccessToken, getTokenExpiration } from 'fast-auth-with-keycloak/token';

const LOCAL_STORAGE_KEY = 'fast-auth-init-config';

// 초기화 설정 없이 접근 가능한 경로 목록
const PUBLIC_PATHS = [
  '/init',
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
  // const [username, setUsername] = useState<string | null>(sessionStorage.getItem('fast-auth-username')); // 사용되지 않으므로 제거
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;

    // 공개 경로가 아니거나 루트 경로인 경우에만 FastAuthProvider 초기화 시도
    const shouldInitializeAuthProvider = !PUBLIC_PATHS.includes(currentPath) || currentPath === '/';

    if (shouldInitializeAuthProvider) {
      const initConfig = localStorage.getItem(LOCAL_STORAGE_KEY);

      if (initConfig) {
        try {
          FastAuthProvider.init(JSON.parse(initConfig));
          
          // 루트 경로일 경우에만 토큰 확인 후 리다이렉트
          if (currentPath === '/') {
            const token = getAccessToken();
            const exp = token ? getTokenExpiration(token) : null;

            if (!token || !exp || Date.now() > exp) {
              navigate('/login', { replace: true });
            } else {
              navigate('/welcome', { replace: true });
            }
          }
        } catch (e) {
          console.error("Failed to initialize FastAuthProvider from localStorage:", e);
          // 초기화 실패 시 init 페이지로 리다이렉트
          navigate('/init', { replace: true });
        }
      } else {
        // 설정이 없으면 init 페이지로 리다이렉트 (공개 경로가 아니거나 루트 경로인 경우)
        navigate('/init', { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/init" element={<InitPage />} />
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
    </ThemeProvider>
  );
}

export default App;
