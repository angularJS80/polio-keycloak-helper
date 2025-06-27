import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function WelcomePage() {
  const username = sessionStorage.getItem('fast-auth-username');
  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', my: 5, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 700 }}>
        환영합니다{username ? `, ${username}` : ''}님!
      </Typography>
    </Box>
  );
} 