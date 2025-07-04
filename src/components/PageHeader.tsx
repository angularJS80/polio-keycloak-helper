import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { SvgIconProps } from '@mui/material/SvgIcon';
import SettingsIcon from '@mui/icons-material/Settings';

interface PageHeaderProps {
  icon: React.ElementType<SvgIconProps>;
  title: string;
  iconColor?: string;
  showSettingsIcon?: boolean;
  onSettingsClick?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ 
  icon: Icon, 
  title, 
  iconColor, 
  showSettingsIcon = false,
  onSettingsClick 
}) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      mb: 2 
    }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Icon sx={{ mr: 1, color: iconColor || '#424242', fontSize: 32 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>
          {title}
        </Typography>
      </Box>
      {showSettingsIcon && (
        <IconButton
          onClick={onSettingsClick}
          sx={{ 
            color: '#5f4b8b',
            '&:hover': {
              backgroundColor: 'rgba(95, 75, 139, 0.1)',
            }
          }}
        >
          <SettingsIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default PageHeader; 