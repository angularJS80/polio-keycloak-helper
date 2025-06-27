import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InitPage from './pages/InitPage';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: {
      main: '#61dafb', // React Blue
      contrastText: '#20232a', // 딥그레이
    },
    secondary: {
      main: '#7c4dff', // 연보라
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
});

function App() {
  const [username, setUsername] = useState<string | null>(sessionStorage.getItem('fast-auth-username'));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/init" element={<InitPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          {/* 필요시 환영 페이지 등 추가 라우트 */}
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
