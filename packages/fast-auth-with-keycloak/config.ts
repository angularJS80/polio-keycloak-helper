import { getItem } from './storage';


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

interface EndpointMeta {
  name: string;
  isValid: () => boolean;
}


export const DEFAULT_INIT_AUTH_CONFIG = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080',
  loginEndpoint: '/auth/login',
  refreshEndpoint: '/auth/refresh',
  logoutEndpoint: '/auth/logout',
  autoRefresh: true,
  onTokenExpiredRedirect: '/login',
  joinEndpoint: '/auth/join',
  passwordChangeEndpoint: '/auth/change-password',
  passwordFindEndpoint: '/auth/find-password',
  passwordResetEndpoint: '/auth/reset-password',
  socialLoginEndpoint: '/auth/social-login?idp=github&scope=openid email profile&redirectUrl=http://localhost:3000/login-by-code',
  loginByCodeEndpoint: '/auth/login-by-code',
  redirectAfterLogin: true,
  redirectPath: '/welcome',
  refreshBeforeExpirySec: 20,
  sessionExpiryAlertEnabled: false,
  sessionExpiryAlertSec: 20

};

// 엔드포인트 타입 정의
export type EndpointType = 'passwordChange' | 'passwordReset' | 'passwordFind' | 'join' | 'logout' | 'refresh' | 'socialLogin' | 'loginByCode';


export const endpointMeta: Record<EndpointType, EndpointMeta> = {
  passwordChange:    { name: '비밀번호 변경', isValid: hasPasswordChangeEndpoint },
  passwordReset:     { name: '비밀번호 초기화', isValid: hasPasswordResetEndpoint },
  passwordFind:      { name: '비밀번호 찾기', isValid: hasPasswordFindEndpoint },
  join:              { name: '계정 등록', isValid: hasJoinEndpoint },
  logout:            { name: '로그아웃', isValid: hasLogoutEndpoint },
  refresh:           { name: '토큰 갱신', isValid: hasRefreshEndpoint },
  socialLogin:       { name: '소셜 로그인', isValid: hasSocialLoginEndpoint },
  loginByCode:       { name: '코드 로그인', isValid: hasLoginByCodeEndpoint },
};


let _cachedConfig: Config | null = null;

// 캐시를 무효화하는 함수 추가
export function clearConfigCache() {
  _cachedConfig = null;
  console.log('[Config] 설정 캐시가 무효화되었습니다.');
}



function _config(): Config {
  const saved = getItem('local', 'fast-auth-config');
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



export function getConfig(forceRefresh: boolean = false): Config {
  if (_cachedConfig && !forceRefresh) {
    return _cachedConfig;
  }

  // 캐시가 없거나 강제 새로고침인 경우 내부 로딩 함수 호출
  _cachedConfig = _config();
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

export function getSocialLoginEndpoint() {
  return getConfig().socialLoginEndpoint || DEFAULT_INIT_AUTH_CONFIG.socialLoginEndpoint || '';
}

export function hasSocialLoginEndpoint(): boolean {
  return !!getSocialLoginEndpoint();
}

export function getLoginByCodeEndpoint() {
  return getConfig().loginByCodeEndpoint || DEFAULT_INIT_AUTH_CONFIG.loginByCodeEndpoint || '';
}

export function hasLoginByCodeEndpoint(): boolean {
  return !!getLoginByCodeEndpoint();
}

export function getLogoutEndpoint() {
  return getConfig().logoutEndpoint || DEFAULT_INIT_AUTH_CONFIG.logoutEndpoint || '';
}

export function hasLogoutEndpoint(): boolean {
  return !!getLogoutEndpoint();
}

export function getRefreshEndpoint() {
  return getConfig().refreshEndpoint || DEFAULT_INIT_AUTH_CONFIG.refreshEndpoint || '';
}

export function hasRefreshEndpoint(): boolean {
  return !!getRefreshEndpoint();
}

export function getRedirectConfig() {
  return {
    redirectAfterLogin: !!getConfig().redirectAfterLogin,
    redirectPath: getConfig().redirectPath || DEFAULT_INIT_AUTH_CONFIG.onTokenExpiredRedirect || '/welcome',
  };
}

export function getLoadedconfig(): Config | null {
  return _cachedConfig;
} 
