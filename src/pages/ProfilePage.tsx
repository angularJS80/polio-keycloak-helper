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
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (token) {
      try {
        const decoded = decodeToken(token);
        if (decoded) {
          setDisplayName(decoded.preferred_username || decoded.username || null);
          setEmail(decoded.email || null);
        }
      } catch (error) {
        console.error("토큰 파싱 오류:", error);
      }
    }
  }, []);

  const handleGoBack = () => {
    navigate('/welcome'); // 또는 이전 페이지로 돌아가는 로직
  };

  return (
    <Layout>
      <PageHeader icon={PersonIcon} title="프로필" iconColor='#424242' />
      
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {displayName && (
          <ListItem disablePadding>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="이름" secondary={displayName} />
          </ListItem>
        )}
        {email && (
          <ListItem disablePadding>
            <ListItemIcon>
              <EmailIcon />
            </ListItemIcon>
            <ListItemText primary="이메일" secondary={email} />
          </ListItem>
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