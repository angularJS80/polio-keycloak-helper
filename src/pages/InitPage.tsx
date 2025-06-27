import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FastAuthProvider } from '../fast-auth-with-keycloak';
import { DEFAULT_AUTH_CONFIG } from '../config';

const LOCAL_STORAGE_KEY = 'fast-auth-init-config';

function loadInitConfig() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return {
        ...DEFAULT_AUTH_CONFIG,
        profileAfterLogin: false,
        profileEndpoint: '/me',
      };
    }
  }
  return {
    ...DEFAULT_AUTH_CONFIG,
    profileAfterLogin: false,
    profileEndpoint: '/me',
  };
}

export default function InitPage() {
  const [initConfig, setInitConfig] = useState(loadInitConfig());
  const navigate = useNavigate();
  return (
    <div style={{ maxWidth: 400, margin: '40px auto', padding: 20, border: '1px solid #ddd', borderRadius: 8 }}>
      <h2>fast-auth-with-keycloak 초기화</h2>
      <label style={{ fontWeight: 'bold' }}>Base URL</label>
      <input
        style={{ width: '100%', marginBottom: 8 }}
        placeholder="Base URL"
        value={initConfig.baseUrl}
        onChange={e => setInitConfig({ ...initConfig, baseUrl: e.target.value })}
      />
      <label style={{ fontWeight: 'bold' }}>로그인 엔드포인트</label>
      <input
        style={{ width: '100%', marginBottom: 8 }}
        placeholder="로그인 엔드포인트"
        value={initConfig.loginEndpoint}
        onChange={e => setInitConfig({ ...initConfig, loginEndpoint: e.target.value })}
      />
      <label style={{ fontWeight: 'bold' }}>리프레쉬 엔드포인트</label>
      <input
        style={{ width: '100%', marginBottom: 8 }}
        placeholder="리프레쉬 엔드포인트"
        value={initConfig.refreshEndpoint}
        onChange={e => setInitConfig({ ...initConfig, refreshEndpoint: e.target.value })}
      />
      <label style={{ fontWeight: 'bold' }}>토큰 자동 갱신</label>
      <label style={{ display: 'block', marginBottom: 8 }}>
        <input
          type="checkbox"
          checked={initConfig.autoRefresh}
          onChange={e => setInitConfig({ ...initConfig, autoRefresh: e.target.checked })}
        /> 토큰 자동 갱신
      </label>
      {initConfig.autoRefresh && (
        <>
          <label style={{ fontWeight: 'bold' }}>토큰 만료 갱신 시점(초 전)</label>
          <input
            type="number"
            min={1}
            style={{ width: '100%', marginBottom: 8 }}
            placeholder="만료 몇 초 전에 갱신할지 입력 (예: 1)"
            value={initConfig.refreshBeforeExpirySec || 1}
            onChange={e => setInitConfig({ ...initConfig, refreshBeforeExpirySec: Number(e.target.value) })}
          />
        </>
      )}
      {!initConfig.autoRefresh && (
        <>
          <label style={{ fontWeight: 'bold' }}>토큰 만료 전 알림</label>
          <label style={{ display: 'block', marginBottom: 8 }}>
            <input
              type="checkbox"
              checked={initConfig.sessionExpiryAlertEnabled || false}
              onChange={e => setInitConfig({ ...initConfig, sessionExpiryAlertEnabled: e.target.checked })}
            /> 토큰 만료 전 알림 활성화
          </label>
          {initConfig.sessionExpiryAlertEnabled && (
            <>
              <label style={{ fontWeight: 'bold' }}>토큰 만료 전 알림 시간(초)</label>
              <input
                type="number"
                min={1}
                style={{ width: '100%', marginBottom: 8 }}
                placeholder="만료 몇 초 전에 알림을 띄울지 입력 (예: 30)"
                value={initConfig.sessionExpiryAlertSec || 30}
                onChange={e => setInitConfig({ ...initConfig, sessionExpiryAlertSec: Number(e.target.value) })}
              />
            </>
          )}
        </>
      )}
      <label style={{ fontWeight: 'bold' }}>만료시 리다이렉트 경로</label>
      <input
        style={{ width: '100%', marginBottom: 8 }}
        placeholder="만료시 리다이렉트 경로"
        value={initConfig.onTokenExpiredRedirect}
        onChange={e => setInitConfig({ ...initConfig, onTokenExpiredRedirect: e.target.value })}
      />
      <label style={{ fontWeight: 'bold' }}>로그인 후 프로필 조회</label>
      <label style={{ display: 'block', marginBottom: 8 }}>
        <input
          type="checkbox"
          checked={initConfig.profileAfterLogin}
          onChange={e => setInitConfig({ ...initConfig, profileAfterLogin: e.target.checked })}
        /> 로그인 후 프로필 조회
      </label>
      {initConfig.profileAfterLogin && (
        <>
          <label style={{ fontWeight: 'bold' }}>프로필 엔드포인트</label>
          <input
            style={{ width: '100%', marginBottom: 8 }}
            placeholder="프로필 엔드포인트"
            value={initConfig.profileEndpoint}
            onChange={e => setInitConfig({ ...initConfig, profileEndpoint: e.target.value })}
          />
        </>
      )}
      <label style={{ fontWeight: 'bold' }}>로그인 후 이동</label>
      <label style={{ display: 'block', marginBottom: 8 }}>
        <input
          type="checkbox"
          checked={initConfig.redirectAfterLogin}
          onChange={e => setInitConfig({ ...initConfig, redirectAfterLogin: e.target.checked })}
        /> 로그인 후 이동
      </label>
      {initConfig.redirectAfterLogin && (
        <>
          <label style={{ fontWeight: 'bold' }}>이동 경로</label>
          <input
            style={{ width: '100%', marginBottom: 8 }}
            placeholder="/welcome"
            value={initConfig.redirectPath || ''}
            onChange={e => setInitConfig({ ...initConfig, redirectPath: e.target.value })}
          />
        </>
      )}
      <button
        style={{ width: '100%', padding: 10, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4 }}
        onClick={() => {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initConfig));
          FastAuthProvider.init(initConfig);
          navigate('/login');
        }}
      >
        초기화
      </button>
    </div>
  );
} 