import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FastAuthProvider } from 'fast-auth-with-keycloak';
import { hasAccessToken } from 'fast-auth-with-keycloak/token';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import SettingsIcon from '@mui/icons-material/Settings';
import Layout from '../components/Layout';
import { getConfig, clearConfigCache } from 'fast-auth-with-keycloak/config';
import { setItem } from 'fast-auth-with-keycloak/storage';
import PageHeader from '../components/PageHeader';


export default function InitPage() {
  const [initConfig, setInitConfig] = useState(getConfig());
  const navigate = useNavigate();
  
  // 페이지 로드 시마다 최신 설정을 다시 로드
  useEffect(() => {
    // 캐시를 무효화하고 최신 설정을 로드
    clearConfigCache();
    const latestConfig = getConfig(true); // 강제 새로고침
    console.log('[InitPage] 최신 설정 로드:', latestConfig);
    setInitConfig(latestConfig);
  }, []);

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
        value={initConfig.codeLoginEndpoint || ''}
        onChange={e => setInitConfig({ ...initConfig, codeLoginEndpoint: e.target.value })}
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
        control={<Checkbox checked={initConfig.profileAfterLogin} onChange={e => setInitConfig({ ...initConfig, profileAfterLogin: e.target.checked })} />}
        label="로그인 후 프로필 조회"
        sx={{ mb: 1 }}
      />
      {initConfig.profileAfterLogin && (
        <TextField
          fullWidth
          label="프로필 엔드포인트"
          variant="outlined"
          margin="normal"
          value={initConfig.profileEndpoint}
          onChange={e => setInitConfig({ ...initConfig, profileEndpoint: e.target.value })}
        />
      )}
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
        onClick={() => {
          try {
            console.log('[InitPage] 설정 저장 시작:', initConfig);
            
            // 로컬 스토리지에 저장
            setItem('local', 'fast-auth-init-config', JSON.stringify(initConfig));
            console.log('[InitPage] 로컬 스토리지 저장 완료');
            
            // 로그인 상태에 따라 적절한 초기화 메서드 사용
            if (hasAccessToken()) {
              // 로그인된 상태: 재초기화 (설정 변경 적용)
              console.log('[InitPage] 로그인된 상태 - 재초기화 실행');
              FastAuthProvider.reinit(initConfig);
            } else {
              // 로그인되지 않은 상태: 초기 초기화
              console.log('[InitPage] 로그인되지 않은 상태 - 초기 초기화 실행');
              FastAuthProvider.init(initConfig);
            }
            
            console.log('[InitPage] 설정 저장 완료');
            
            // 로그인 상태에 따라 적절한 페이지로 이동
            if (hasAccessToken()) {
              // 로그인된 상태: 이전 페이지로 돌아가거나 welcome 페이지로
              const currentPath = window.location.pathname;
              if (currentPath === '/config') {
                // 설정 페이지에서 직접 접근한 경우 welcome으로
                navigate('/welcome');
              } else {
                // 다른 페이지에서 설정으로 온 경우 이전 페이지로
                navigate(-1);
              }
            } else {
              // 로그인되지 않은 상태: 로그인 페이지로
              navigate('/login');
            }
          } catch (error) {
            console.error('[InitPage] 설정 저장 중 오류 발생:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            alert('설정 저장 중 오류가 발생했습니다: ' + errorMessage);
          }
        }}
      >
        저장
      </Button>
    </Layout>
  );
} 