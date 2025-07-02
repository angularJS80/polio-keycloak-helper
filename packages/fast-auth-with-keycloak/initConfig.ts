import { getItem } from './storage';

interface InitConfig {
  baseUrl: string;
  loginEndpoint: string;
  refreshEndpoint: string;
  logoutEndpoint: string;
  autoRefresh: boolean;
  onTokenExpiredRedirect: string;
  profileAfterLogin: boolean;
  profileEndpoint: string;
  joinEndpoint: string;
  passwordChangeEndpoint: string;
  passwordFindEndpoint: string;
  passwordResetEndpoint: string;
  socialLoginEndpoint: string;
  codeLoginEndpoint: string;
  refreshBeforeExpirySec?: number;
  sessionExpiryAlertSec?: number;
  sessionExpiryAlertEnabled?: boolean;
  redirectAfterLogin?: boolean;
  redirectPath?: string;
}

let _cachedConfig: InitConfig | null = null;

function _loadInitConfigInternal(): InitConfig {
  const saved = getItem('local', 'fast-auth-init-config');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // JSON 파싱 오류 발생 시 기본값 반환
      return { ...DEFAULT_INIT_AUTH_CONFIG };
    }
  }
  // 저장된 설정이 없으면 기본값 반환
  return { ...DEFAULT_INIT_AUTH_CONFIG };
}

export const DEFAULT_INIT_AUTH_CONFIG = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  loginEndpoint: '/auth/login',
  refreshEndpoint: '/auth/refresh',
  logoutEndpoint: '/auth/logout',
  autoRefresh: true,
  onTokenExpiredRedirect: '/login',
  profileAfterLogin: false,
  profileEndpoint: '/me',
  joinEndpoint: '/auth/join',
  passwordChangeEndpoint: '/auth/password-change',
  passwordFindEndpoint: '/auth/password-find',
  passwordResetEndpoint: '/auth/reset-password',
  socialLoginEndpoint: '/auth/social-login',
  codeLoginEndpoint: '/auth/login-by-code',
};

export function getInitConfig(): InitConfig {
  if (_cachedConfig) {
    return _cachedConfig;
  }

  // 캐시가 없는 경우에만 내부 로딩 함수 호출
  _cachedConfig = _loadInitConfigInternal();
  return _cachedConfig;
}

export function getRefreshBeforeExpirySec() {
  const config = getInitConfig();
  return Number(config.refreshBeforeExpirySec) || 1;
}

export function getSessionExpiryAlertSec() {
  const config = getInitConfig();
  return Number(config.sessionExpiryAlertSec) || 30;
}

export function getSessionExpiryAlertEnabled() {
  const config = getInitConfig();
  return !!config.sessionExpiryAlertEnabled;
}

export function getJoinEndpoint() {
  const config = getInitConfig();
  return config.joinEndpoint || DEFAULT_INIT_AUTH_CONFIG.joinEndpoint || '/join';
}

export function getPasswordChangeEndpoint() {
  const config = getInitConfig();
  return config.passwordChangeEndpoint || DEFAULT_INIT_AUTH_CONFIG.passwordChangeEndpoint || '';
}

export function getPasswordFindEndpoint() {
  const config = getInitConfig();
  return config.passwordFindEndpoint || DEFAULT_INIT_AUTH_CONFIG.passwordFindEndpoint || '';
}

export function getPasswordResetEndpoint() {
  const config = getInitConfig();
  return config.passwordResetEndpoint || DEFAULT_INIT_AUTH_CONFIG.passwordResetEndpoint || '';
}

export function getProfileConfig() {
  const config = getInitConfig();
  return {
    profileAfterLogin: !!config.profileAfterLogin,
    profileEndpoint: config.profileEndpoint || DEFAULT_INIT_AUTH_CONFIG.profileEndpoint || '/me',
  };
}

export function getRedirectConfig() {
  const config = getInitConfig();
  return {
    redirectAfterLogin: !!config.redirectAfterLogin,
    redirectPath: config.redirectPath || DEFAULT_INIT_AUTH_CONFIG.onTokenExpiredRedirect || '/welcome',
  };
}

export function getLoadedInitConfig(): InitConfig | null {
  return _cachedConfig;
} 