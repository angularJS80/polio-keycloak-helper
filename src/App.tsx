import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import InitPage from './pages/InitPage';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getAccessToken, getTokenExpiration } from './fast-auth-with-keycloak/token';

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
  const [username, setUsername] = useState<string | null>(sessionStorage.getItem('fast-auth-username'));
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 루트(/) 경로에서만 동작
    if (location.pathname === '/') {
      const initConfig = localStorage.getItem('fast-auth-init-config');
      if (!initConfig) {
        navigate('/init', { replace: true });
        return;
      }
      const token = getAccessToken();
      if (!token) {
        navigate('/login', { replace: true });
        return;
      }
      const exp = getTokenExpiration(token);
      if (!exp || Date.now() > exp) {
        navigate('/login', { replace: true });
        return;
      }
      // 토큰이 있고 만료되지 않았으면 환영 페이지로
      navigate('/welcome', { replace: true });
    }
  }, [location.pathname]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/init" element={<InitPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        {/* 필요시 환영 페이지 등 추가 라우트 */}
      </Routes>
    </ThemeProvider>
  );
}

export default App;
