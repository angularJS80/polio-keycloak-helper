import { getItem } from './storage';

// 엔드포인트 타입 정의
export type EndpointType = 'passwordChange' | 'passwordReset' | 'passwordFind' | 'join' | 'logout' | 'refresh';

interface Config {
  baseUrl: string;
  loginEndpoint: string;
  refreshEndpoint: string;
  logoutEndpoint: string;
  autoRefresh: boolean;
  onTokenExpiredRedirect: string;
  joinEndpoint: string;
  passwordChangeEndpoint: string;
  passwordFindEndpoint: string;
  passwordResetEndpoint: string;
  socialLoginEndpoint: string;
  loginByCodeEndpoint: string;
  refreshBeforeExpirySec?: number;
  sessionExpiryAlertSec?: number;
  sessionExpiryAlertEnabled: boolean;
  redirectAfterLogin?: boolean;
  redirectPath?: string;
  onSessionExpiryAlert?: (onExtend: () => void, onLogout: () => void) => void;
}

let _cachedConfig: Config | null = null;

// 캐시를 무효화하는 함수 추가
export function clearConfigCache() {
  _cachedConfig = null;
  console.log('[Config] 설정 캐시가 무효화되었습니다.');
}

// 전역으로 노출 (다른 모듈에서 사용하기 위해)
if (typeof window !== 'undefined') {
  (window as any).__clearConfigCache = clearConfigCache;
}

function _initConfig(): Config {
  const saved = getItem('local', 'fast-auth-init-config');
  if (saved) {
    try {
      const parsedConfig = JSON.parse(saved);
      console.log('[Config] 로컬 스토리지에서 설정 로드:', parsedConfig);
      return parsedConfig;
    } catch {
      // JSON 파싱 오류 발생 시 기본값 반환
      console.log('[Config] JSON 파싱 오류, 기본값 사용');
      return { ...DEFAULT_INIT_AUTH_CONFIG };
    }
  }
  // 저장된 설정이 없으면 기본값 반환
  console.log('[Config] 저장된 설정 없음, 기본값 사용');
  return { ...DEFAULT_INIT_AUTH_CONFIG };
}

export const DEFAULT_INIT_AUTH_CONFIG = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  loginEndpoint: '/auth/login',
  refreshEndpoint: '/auth/refresh',
  logoutEndpoint: '/auth/logout',
  autoRefresh: false,
  onTokenExpiredRedirect: '/login',
  joinEndpoint: '/auth/join',
  passwordChangeEndpoint: '/auth/change-password',
  passwordFindEndpoint: '/auth/find-password',
  passwordResetEndpoint: '/auth/reset-password',
  socialLoginEndpoint: '/auth/social-login?idp=github&scope=openid email profile&redirectUrl=http://localhost:3000/auth/callback',
  loginByCodeEndpoint: '/auth/login-by-code',
  redirectAfterLogin: true,
  redirectPath: '/welcome',
  refreshBeforeExpirySec: 20,
  sessionExpiryAlertEnabled: true,
  sessionExpiryAlertSec: 20

};

export function getConfig(forceRefresh: boolean = false): Config {
  if (_cachedConfig && !forceRefresh) {
    return _cachedConfig;
  }

  // 캐시가 없거나 강제 새로고침인 경우 내부 로딩 함수 호출
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

export function hasJoinEndpoint(): boolean {
  return !!getJoinEndpoint();
}

export function getPasswordChangeEndpoint() {
  
  return getConfig().passwordChangeEndpoint || DEFAULT_INIT_AUTH_CONFIG.passwordChangeEndpoint || '';
}

export function hasPasswordChangeEndpoint(): boolean {
  return !!getPasswordChangeEndpoint();
}

export function getPasswordFindEndpoint() {
  return getConfig().passwordFindEndpoint || DEFAULT_INIT_AUTH_CONFIG.passwordFindEndpoint || '';
}

export function hasPasswordFindEndpoint(): boolean {
  return !!getPasswordFindEndpoint();
}

export function getPasswordResetEndpoint() {
  
  return getConfig().passwordResetEndpoint || DEFAULT_INIT_AUTH_CONFIG.passwordResetEndpoint || '';
}


export function hasPasswordResetEndpoint(): boolean {
  return !!getPasswordResetEndpoint();
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
