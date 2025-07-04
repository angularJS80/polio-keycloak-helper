import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import Stack from '@mui/material/Stack';
import { useProfilePage } from '../hooks/useProfilePage';

const ProfilePage: React.FC = () => {
  const {
    profile,
    handleGoBack,
    handlePasswordChange,
    handleSettings,
  } = useProfilePage();

  return (
    <Layout>
      <PageHeader 
        icon={PersonIcon} 
        title="프로필" 
        iconColor='#424242'
        showSettingsIcon={true}
        onSettingsClick={handleSettings}
      />
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {profile && (
          <>
            <ListItem disablePadding>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="이름" secondary={profile.name || '정보 없음'} />
            </ListItem>
            <ListItem disablePadding>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText primary="이메일" secondary={profile.email || '정보 없음'} />
            </ListItem>
          </>
        )}
      </List>
      <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGoBack}
          startIcon={<ArrowBackIcon />}
        >
          뒤로가기
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={handlePasswordChange}
          startIcon={<VpnKeyIcon />}
        >
          비밀번호 변경
        </Button>
      </Stack>
    </Layout>
  );
};

export default ProfilePage; 