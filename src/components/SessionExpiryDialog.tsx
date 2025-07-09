import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box
} from '@mui/material';
import { setSessionExpiryState } from 'fast-auth-with-keycloak';

interface SessionExpiryDialogProps {
  open: boolean;
  onExtend: (() => void) | null;
  onLogout: (() => void) | null;
}

const SessionExpiryDialog: React.FC<SessionExpiryDialogProps> = ({
  open,
  onExtend,
  onLogout
}) => {
  const handleExtend = () => {
    if (onExtend) {
      onExtend();
    }
    // 다이얼로그 닫기
    setSessionExpiryState(false);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setSessionExpiryState(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleLogout} // ESC 키나 backdrop 클릭시 로그아웃
      aria-labelledby="session-expiry-dialog-title"
      aria-describedby="session-expiry-dialog-description"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="session-expiry-dialog-title">
        세션 만료 알림
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" gutterBottom>
            로그인 세션이 곧 만료됩니다.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            계속 사용하시려면 세션을 연장해주세요.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button 
          onClick={handleLogout} 
          variant="outlined" 
          color="error"
        >
          로그아웃
        </Button>
        <Button 
          onClick={handleExtend} 
          variant="contained" 
          color="primary"
          autoFocus
        >
          세션 연장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionExpiryDialog; 