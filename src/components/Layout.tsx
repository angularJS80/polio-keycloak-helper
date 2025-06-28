import React from 'react';
import Box from '@mui/material/Box';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', my: 5, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2, position: 'relative', overflow: 'hidden' }}>
      {children}
    </Box>
  );
};

export default Layout; 