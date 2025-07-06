import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import WarningIcon from '@mui/icons-material/Warning';
import { MessageType } from '../hooks/useMessage';

export default function CommonMessageDialog({ message, onClose }: { message: MessageType, onClose: () => void }) {
 
  if (!message) return null;
  return (
    <Dialog open={!!message} onClose={onClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">
        <Stack direction="row" alignItems="center" spacing={1}>
          <WarningIcon color={message.type === "success" ? "success" : "warning"} />
          <Typography variant="h6">알림</Typography>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Typography id="alert-dialog-description">{message.text}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} autoFocus>확인</Button>
      </DialogActions>
    </Dialog>
  );
} 