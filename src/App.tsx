import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import SessionExpiryDialog from './components/SessionExpiryDialog';
import { useAppCore } from './hooks/useAppCore';

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
  const { dialogState } = useAppCore();

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
      {dialogState.show && (
        <SessionExpiryDialog
          open={dialogState.show}
          onExtend={dialogState.onExtend}
          onLogout={dialogState.onLogout}
        />
      )}
    </ThemeProvider>
  );
}

export default App;
