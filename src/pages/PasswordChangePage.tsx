import React from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import WarningIcon from '@mui/icons-material/Warning';
import Stack from '@mui/material/Stack';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { usePasswordChangePage } from '../hooks/usePasswordChangePage';

export default function PasswordChangePage() {
  const {
    newPassword,
    setNewPassword,
    confirmNewPassword,
    setConfirmNewPassword,
    message,
    handleCloseMessage,
    handleSubmit,
    loading,
    handleGoToWelcome,
  } = usePasswordChangePage();

  return (
    <Layout>
      <PageHeader icon={VpnKeyIcon} title="비밀번호 변경" iconColor='#00CED1' />
      {message && (
        <Dialog
          open={!!message}
          onClose={handleCloseMessage}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            <Stack direction="row" alignItems="center" spacing={1}>
              <WarningIcon color={message.type === "success" ? "success" : "warning"} />
              <Typography variant="h6">알림</Typography>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Typography id="alert-dialog-description">
              {message.text}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMessage} autoFocus>확인</Button>
          </DialogActions>
        </Dialog>
      )}
      <Box sx={{ maxWidth: 400, mx: 'auto', my: 5, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <VpnKeyIcon sx={{ mr: 1, color: '#009e6d', fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 700 }}>비밀번호 변경</Typography>
        </Box>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="새 비밀번호"
            type="password"
            variant="outlined"
            margin="normal"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="새 비밀번호 확인"
            type="password"
            variant="outlined"
            margin="normal"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            required
          />
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2, fontWeight: 700 }}
            type="submit"
            disabled={loading}
          >
            {loading ? '변경 중...' : '비밀번호 변경'}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="info"
            size="large"
            sx={{ mt: 1, fontWeight: 700 }}
            onClick={handleGoToWelcome}
            disabled={loading}
          >
            환영 페이지로 돌아가기
          </Button>
        </form>
      </Box>
    </Layout>
  );
} 