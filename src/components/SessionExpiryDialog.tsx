import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import WarningIcon from '@mui/icons-material/Warning';
import Stack from '@mui/material/Stack';

interface SessionExpiryDialogProps {
  open: boolean;
  onExtend: () => void;
  onLogout: () => void;
}

const SessionExpiryDialog: React.FC<SessionExpiryDialogProps> = ({
  open,
  onExtend,
  onLogout,
}) => {
  return (
    <Dialog
      open={open}
      // 사용자가 직접 닫는 것을 허용하지 않음 (강제 액션 유도)
      aria-labelledby="session-expiry-dialog-title"
      aria-describedby="session-expiry-dialog-description"
    >
      <DialogTitle id="session-expiry-dialog-title">
        <Stack direction="row" alignItems="center" spacing={1}>
          <WarningIcon color="warning" />
          <Typography variant="h6">세션 만료 경고</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Typography id="session-expiry-dialog-description" gutterBottom>
          로그인 세션이 곧 만료됩니다. 계속 사용하시려면 세션을 연장해주세요.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onLogout} color="secondary">
          로그아웃
        </Button>
        <Button onClick={onExtend} color="primary" variant="contained" autoFocus>
          세션 연장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionExpiryDialog; 