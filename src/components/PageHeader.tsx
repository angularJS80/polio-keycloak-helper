import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SvgIconProps } from '@mui/material/SvgIcon';

interface PageHeaderProps {
  icon: React.ElementType<SvgIconProps>;
  title: string;
  iconColor?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ icon: Icon, title, iconColor }) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Icon sx={{ mr: 1, color: iconColor || '#424242', fontSize: 32 }} />
      <Typography variant="h5" sx={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>
        {title}
      </Typography>
    </Box>
  );
};

export default PageHeader; 