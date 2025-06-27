import React from 'react';

export default function WelcomePage() {
  const username = sessionStorage.getItem('fast-auth-username');
  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
      <h1>환영합니다{username ? `, ${username}` : ''}님!</h1>
    </div>
  );
} 