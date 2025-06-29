import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { getAccessToken, decodeToken } from 'fast-auth-with-keycloak/token';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ name?: string; email?: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const accessToken = await getAccessToken();
        if (accessToken) {
          const decoded = decodeToken(accessToken);
          setProfile({ name: decoded?.name, email: decoded?.email });
        }
      } catch (error) {
        console.error("Error fetching or decoding token:", error);
        setProfile(null);
      }
    };

    fetchProfile();
  }, []);

  const handleGoBack = () => {
    navigate('/welcome'); // 또는 이전 페이지로 돌아가는 로직
  };

  return (
    <Layout>
      <PageHeader icon={PersonIcon} title="프로필" iconColor='#424242' />
      
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

      <Button
        variant="contained"
        color="primary"
        onClick={handleGoBack}
        startIcon={<ArrowBackIcon />}
      >
        뒤로가기
      </Button>
    </Layout>
  );
};

export default ProfilePage; 