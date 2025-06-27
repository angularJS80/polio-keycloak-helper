import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import InitPage from './pages/InitPage';
import LoginPage from './pages/LoginPage';
import WelcomePage from './pages/WelcomePage';

function App() {
  const [username, setUsername] = useState<string | null>(sessionStorage.getItem('fast-auth-username'));

  return (
    <Router>
      <Routes>
        <Route path="/init" element={<InitPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/welcome" element={<WelcomePage />} />
        {/* 필요시 환영 페이지 등 추가 라우트 */}
      </Routes>
    </Router>
  );
}

export default App;
