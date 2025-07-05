import React from 'react';
import { Box, CircularProgress, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import Layout from '../components/Layout';
import WarningIcon from '@mui/icons-material/Warning';
import Stack from '@mui/material/Stack';
import { useLoginByOauthPage } from '../hooks/useLoginByOauthPage';

export default function LoginByOauthPage() {
  const {
    message,
    error,
    handleCloseError,
  } = useLoginByOauthPage();

  return (
    <Layout>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 64px)' }}>
        {!error ? (
          <>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">{message}</Typography>
          </>
        ) : (
          <Dialog
            open={!!error}
            onClose={handleCloseError}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              <Stack direction="row" alignItems="center" spacing={1}>
                <WarningIcon color="error" />
                <Typography variant="h6">인증 오류</Typography>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <Typography id="alert-dialog-description">
                {error}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseError} autoFocus>
                로그인 페이지로 돌아가기
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </Box>
    </Layout>
  );
} 