import React from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import SettingsIcon from '@mui/icons-material/Settings';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import { useConfigPage } from '../hooks/useConfigPage';

export default function ConfigPage() {
  const { config, setConfig, handleSave } = useConfigPage();

  return (
    <Layout>
      <PageHeader icon={SettingsIcon} title="인증 엄청 귀찮지? 한방에!" iconColor='#808080' />
      <TextField
        fullWidth
        label="Base URL"
        variant="outlined"
        margin="normal"
        value={config.baseUrl}
        onChange={e => setConfig({ ...config, baseUrl: e.target.value })}
      />
      <TextField
        fullWidth
        label="계정등록 엔드포인트"
        variant="outlined"
        margin="normal"
        value={config.joinEndpoint || ''}
        onChange={e => setConfig({ ...config, joinEndpoint: e.target.value })}
      />
      <TextField
        fullWidth
        label="로그인 엔드포인트"
        variant="outlined"
        margin="normal"
        value={config.loginEndpoint || ''}
        onChange={e => setConfig({ ...config, loginEndpoint: e.target.value })}
      />
      <TextField
        fullWidth
        label="비밀번호 변경 엔드포인트"
        variant="outlined"
        margin="normal"
        value={config.passwordChangeEndpoint || ''}
        onChange={e => setConfig({ ...config, passwordChangeEndpoint: e.target.value })}
      />
      <TextField
        fullWidth
        label="비밀번호 초기화 엔드포인트"
        variant="outlined"
        margin="normal"
        value={config.passwordResetEndpoint || ''}
        onChange={e => setConfig({ ...config, passwordResetEndpoint: e.target.value })}
      />
      <TextField
        fullWidth
        label="비밀번호 찾기 엔드포인트"
        variant="outlined"
        margin="normal"
        value={config.passwordFindEndpoint || ''}
        onChange={e => setConfig({ ...config, passwordFindEndpoint: e.target.value })}
      />
      <TextField
        fullWidth
        label="로그아웃 엔드포인트"
        variant="outlined"
        margin="normal"
        value={config.logoutEndpoint || ''}
        onChange={e => setConfig({ ...config, logoutEndpoint: e.target.value })}
      />
      <TextField
        fullWidth
        label="소셜 로그인 링크"
        variant="outlined"
        margin="normal"
        value={config.loginEndpoint || ''}
        onChange={e => setConfig({ ...config, socialLoginEndpoint: e.target.value })}
      />
      <TextField
        fullWidth
        label="코드 로그인 엔드포인트"
        variant="outlined"
        margin="normal"
        value={config.loginByCodeEndpoint || ''}
        onChange={e => setConfig({ ...config, loginByCodeEndpoint: e.target.value })}
      />
      <TextField
        fullWidth
        label="리프레쉬 엔드포인트"
        variant="outlined"
        margin="normal"
        value={config.refreshEndpoint}
        onChange={e => setConfig({ ...config, refreshEndpoint: e.target.value })}
      />
      <FormControlLabel
        control={<Checkbox checked={config.autoRefresh} onChange={e => setConfig({ ...config, autoRefresh: e.target.checked })} />}
        label="토큰 자동 갱신"
        sx={{ mb: 1 }}
      />
      {config.autoRefresh && (
        <TextField
          fullWidth
          type="number"
          label="토큰 만료 갱신 시점(초 전)"
          variant="outlined"
          margin="normal"
          inputProps={{ min: 1 }}
          value={config.refreshBeforeExpirySec || 1}
          onChange={e => setConfig({ ...config, refreshBeforeExpirySec: Number(e.target.value) })}
        />
      )}
      {!config.autoRefresh && (
        <>
          <FormControlLabel
            control={<Checkbox checked={config.sessionExpiryAlertEnabled || false} onChange={e => setConfig({ ...config, sessionExpiryAlertEnabled: e.target.checked })} />}
            label="토큰 만료 전 알림 활성화"
            sx={{ mb: 1 }}
          />
          {config.sessionExpiryAlertEnabled && (
            <TextField
              fullWidth
              type="number"
              label="토큰 만료 전 알림 시간(초)"
              variant="outlined"
              margin="normal"
              inputProps={{ min: 1 }}
              value={config.sessionExpiryAlertSec || 30}
              onChange={e => setConfig({ ...config, sessionExpiryAlertSec: Number(e.target.value) })}
            />
          )}
        </>
      )}
      <TextField
        fullWidth
        label="만료시 리다이렉트 경로"
        variant="outlined"
        margin="normal"
        value={config.onTokenExpiredRedirect}
        onChange={e => setConfig({ ...config, onTokenExpiredRedirect: e.target.value })}
      />

      <FormControlLabel
        control={<Checkbox checked={config.redirectAfterLogin} onChange={e => setConfig({ ...config, redirectAfterLogin: e.target.checked })} />}
        label="로그인 후 이동"
        sx={{ mb: 1 }}
      />
      {config.redirectAfterLogin && (
        <TextField
          fullWidth
          label="이동 경로"
          variant="outlined"
          margin="normal"
          value={config.redirectPath || ''}
          onChange={e => setConfig({ ...config, redirectPath: e.target.value })}
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