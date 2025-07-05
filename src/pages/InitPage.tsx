import React from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import SettingsIcon from '@mui/icons-material/Settings';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { useInitPage } from '../hooks/useInitPage';

export default function InitPage() {
  const { initConfig, setInitConfig, handleSave } = useInitPage();

  return (
    <Layout>
      <PageHeader icon={SettingsIcon} title="인증 엄청 귀찮지? 한방에!" iconColor='#808080' />
      <TextField
        fullWidth
        label="Base URL"
        variant="outlined"
        margin="normal"
        value={initConfig.baseUrl}
        onChange={e => setInitConfig({ ...initConfig, baseUrl: e.target.value })}
      />
      <TextField
        fullWidth
        label="계정등록 엔드포인트"
        variant="outlined"
        margin="normal"
        value={initConfig.joinEndpoint || ''}
        onChange={e => setInitConfig({ ...initConfig, joinEndpoint: e.target.value })}
      />
      <TextField
        fullWidth
        label="로그인 엔드포인트"
        variant="outlined"
        margin="normal"
        value={initConfig.loginEndpoint}
        onChange={e => setInitConfig({ ...initConfig, loginEndpoint: e.target.value })}
      />
      <TextField
        fullWidth
        label="비밀번호 변경 엔드포인트"
        variant="outlined"
        margin="normal"
        value={initConfig.passwordChangeEndpoint || ''}
        onChange={e => setInitConfig({ ...initConfig, passwordChangeEndpoint: e.target.value })}
      />
      <TextField
        fullWidth
        label="비밀번호 초기화 엔드포인트"
        variant="outlined"
        margin="normal"
        value={initConfig.passwordResetEndpoint || ''}
        onChange={e => setInitConfig({ ...initConfig, passwordResetEndpoint: e.target.value })}
      />
      <TextField
        fullWidth
        label="비밀번호 찾기 엔드포인트"
        variant="outlined"
        margin="normal"
        value={initConfig.passwordFindEndpoint || ''}
        onChange={e => setInitConfig({ ...initConfig, passwordFindEndpoint: e.target.value })}
      />
      <TextField
        fullWidth
        label="로그아웃 엔드포인트"
        variant="outlined"
        margin="normal"
        value={initConfig.logoutEndpoint || ''}
        onChange={e => setInitConfig({ ...initConfig, logoutEndpoint: e.target.value })}
      />
      <TextField
        fullWidth
        label="소셜 로그인 링크"
        variant="outlined"
        margin="normal"
        value={initConfig.socialLoginEndpoint || ''}
        onChange={e => setInitConfig({ ...initConfig, socialLoginEndpoint: e.target.value })}
      />
      <TextField
        fullWidth
        label="코드 로그인 엔드포인트"
        variant="outlined"
        margin="normal"
        value={initConfig.loginByCodeEndpoint || ''}
        onChange={e => setInitConfig({ ...initConfig, loginByCodeEndpoint: e.target.value })}
      />
      <TextField
        fullWidth
        label="리프레쉬 엔드포인트"
        variant="outlined"
        margin="normal"
        value={initConfig.refreshEndpoint}
        onChange={e => setInitConfig({ ...initConfig, refreshEndpoint: e.target.value })}
      />
      <FormControlLabel
        control={<Checkbox checked={initConfig.autoRefresh} onChange={e => setInitConfig({ ...initConfig, autoRefresh: e.target.checked })} />}
        label="토큰 자동 갱신"
        sx={{ mb: 1 }}
      />
      {initConfig.autoRefresh && (
        <TextField
          fullWidth
          type="number"
          label="토큰 만료 갱신 시점(초 전)"
          variant="outlined"
          margin="normal"
          inputProps={{ min: 1 }}
          value={initConfig.refreshBeforeExpirySec || 1}
          onChange={e => setInitConfig({ ...initConfig, refreshBeforeExpirySec: Number(e.target.value) })}
        />
      )}
      {!initConfig.autoRefresh && (
        <>
          <FormControlLabel
            control={<Checkbox checked={initConfig.sessionExpiryAlertEnabled || false} onChange={e => setInitConfig({ ...initConfig, sessionExpiryAlertEnabled: e.target.checked })} />}
            label="토큰 만료 전 알림 활성화"
            sx={{ mb: 1 }}
          />
          {initConfig.sessionExpiryAlertEnabled && (
            <TextField
              fullWidth
              type="number"
              label="토큰 만료 전 알림 시간(초)"
              variant="outlined"
              margin="normal"
              inputProps={{ min: 1 }}
              value={initConfig.sessionExpiryAlertSec || 30}
              onChange={e => setInitConfig({ ...initConfig, sessionExpiryAlertSec: Number(e.target.value) })}
            />
          )}
        </>
      )}
      <TextField
        fullWidth
        label="만료시 리다이렉트 경로"
        variant="outlined"
        margin="normal"
        value={initConfig.onTokenExpiredRedirect}
        onChange={e => setInitConfig({ ...initConfig, onTokenExpiredRedirect: e.target.value })}
      />

      <FormControlLabel
        control={<Checkbox checked={initConfig.redirectAfterLogin} onChange={e => setInitConfig({ ...initConfig, redirectAfterLogin: e.target.checked })} />}
        label="로그인 후 이동"
        sx={{ mb: 1 }}
      />
      {initConfig.redirectAfterLogin && (
        <TextField
          fullWidth
          label="이동 경로"
          variant="outlined"
          margin="normal"
          value={initConfig.redirectPath || ''}
          onChange={e => setInitConfig({ ...initConfig, redirectPath: e.target.value })}
        />
      )}
      <Button
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        sx={{ mt: 2, fontWeight: 700 }}
        onClick={handleSave}
      >
        저장
      </Button>
    </Layout>
  );
} 