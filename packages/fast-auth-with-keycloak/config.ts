import { getItem } from './storage';
import { FastAuthProvider } from 'fast-auth-with-keycloak';
interface Config {
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

let _cachedConfig: Config | null = null;

function _initConfig(): Config {
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
  passwordChangeEndpoint: '/auth/change-password',
  passwordFindEndpoint: '/auth/find-password',
  passwordResetEndpoint: '/auth/reset-password',
  socialLoginEndpoint: '/auth/social-login?idp=github&scope=openid email profile&redirectUrl=http://localhost:3000/auth/callback',
  codeLoginEndpoint: '/auth/login-by-code',
  redirectAfterLogin: true,
  redirectPath: '/welcome'

};

export function getConfig(): Config {
  if (_cachedConfig) {
    return _cachedConfig;
  }

  // 캐시가 없는 경우에만 내부 로딩 함수 호출
  _cachedConfig = _initConfig();
  return _cachedConfig;
}

export function getRefreshBeforeExpirySec() {
  return Number(getConfig().refreshBeforeExpirySec) || 1;
}

export function getSessionExpiryAlertSec() {
  
  return Number(getConfig().sessionExpiryAlertSec) || 30;
}

export function getSessionExpiryAlertEnabled() {
  
  return !!getConfig().sessionExpiryAlertEnabled;
}

export function getJoinEndpoint() {
  
  return getConfig().joinEndpoint || DEFAULT_INIT_AUTH_CONFIG.joinEndpoint || '/join';
}

export function getPasswordChangeEndpoint() {
  
  return getConfig().passwordChangeEndpoint || DEFAULT_INIT_AUTH_CONFIG.passwordChangeEndpoint || '';
}

export function getPasswordFindEndpoint() {
  
  return getConfig().passwordFindEndpoint || DEFAULT_INIT_AUTH_CONFIG.passwordFindEndpoint || '';
}

export function getPasswordResetEndpoint() {
  
  return getConfig().passwordResetEndpoint || DEFAULT_INIT_AUTH_CONFIG.passwordResetEndpoint || '';
}

export function getProfileConfig() {
  
  return {
    profileAfterLogin: !!getConfig().profileAfterLogin,
    profileEndpoint: getConfig().profileEndpoint || DEFAULT_INIT_AUTH_CONFIG.profileEndpoint || '/me',
  };
}

export function getRedirectConfig() {
  return {
    redirectAfterLogin: !!getConfig().redirectAfterLogin,
    redirectPath: getConfig().redirectPath || DEFAULT_INIT_AUTH_CONFIG.onTokenExpiredRedirect || '/welcome',
  };
}

export function getLoadedInitConfig(): Config | null {
  return _cachedConfig;
} 


export function ensureInit() {
  FastAuthProvider.init(getConfig());
} 