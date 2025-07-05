// fast-auth-with-keycloak 패키지 진입점

import { setAccessToken, removeAccessToken, getAccessToken, getAccessTokenExpiration, setRefreshToken, removeRefreshToken, getRefreshToken, hasAccessToken, getAccessTokenInfo } from './token';
import { handleApiResponse } from './apiResultHandler';
import { getConfig, getRefreshBeforeExpirySec, getSessionExpiryAlertSec, getSessionExpiryAlertEnabled, } from './config';
import { 
  validateFastAuthConfig, 
  validateRefreshToken, 
  validateEndpoint, 
  validateApiRequestOptions,
  validateLogoutRequest,
  validateTokenRefreshRequest,
  validateRequiredConfig,
  validateToken,
  validateUrlToken,
  validateAuthCode
} from './validator';

export type FastAuthConfig = {
  baseUrl: string;
  loginEndpoint: string;
  refreshEndpoint: string;
  autoRefresh: boolean;
  onTokenExpiredRedirect?: string;
  logoutEndpoint?: string;
  onTokenExpiredNavigate?: (path: string) => void;
  // onSessionExpiryAlert 제거 - 더 이상 필요 없음
};

let fastAuthConfig: FastAuthConfig | null = null;
let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
let expiryLogInterval: ReturnType<typeof setInterval> | null = null;
let enableExpiryLog = true;
let alertShownForThisSession = false;
let isInitialized = false; // 초기화 플래그 추가

// 이벤트 시스템으로 다이얼로그 상태 관리
type DialogState = {
  show: boolean;
  onExtend: (() => void) | null;
  onLogout: (() => void) | null;
};

type DialogStateListener = (state: DialogState) => void;

let dialogStateListeners: DialogStateListener[] = [];
let currentDialogState: DialogState = {
  show: false,
  onExtend: null,
  onLogout: null
};

// 이벤트 리스너 등록/해제
export function addDialogStateListener(listener: DialogStateListener) {
  dialogStateListeners.push(listener);
  // 등록 즉시 현재 상태 전달
  listener(currentDialogState);
}

export function removeDialogStateListener(listener: DialogStateListener) {
  dialogStateListeners = dialogStateListeners.filter(l => l !== listener);
}

// 상태 변경 시 모든 리스너에게 알림
function notifyDialogStateChange(state: DialogState) {
  currentDialogState = state;
  dialogStateListeners.forEach(listener => listener(state));
}

// 전역 함수로 다이얼로그 상태 관리
export function setSessionExpiryDialogState(show: boolean, onExtend?: () => void, onLogout?: () => void) {
  const newState = {
    show,
    onExtend: onExtend || null,
    onLogout: onLogout || null
  };
  notifyDialogStateChange(newState);
}

export function checkSessionExpiryDialogState() {
  return currentDialogState;
}

export class FastAuthProvider {
  static init(config: FastAuthConfig) {
    // 이미 초기화되었다면 중복 실행 방지
    if (isInitialized) {
      console.log('[FastAuth] 이미 초기화되어 있음, 중복 실행 방지');
      return;
    }
    
    // 설정 유효성 검사
    const configValidation = validateFastAuthConfig(config);
    if (!configValidation.isValid) {
      console.error('[FastAuth] 설정 유효성 검사 실패:', configValidation.error);
      throw new Error(configValidation.error);
    }
    
    fastAuthConfig = { ...config };
    console.log('[FastAuth] FastAuthProvider initialized with config:', fastAuthConfig);
    if (config.onTokenExpiredNavigate) {
      FastAuthProvider._onTokenExpiredNavigate = config.onTokenExpiredNavigate;
      console.log('[FastAuth] onTokenExpiredNavigate 콜백 등록됨');
    }
    // onSessionExpiryAlert 제거 - 더 이상 필요 없음
    
    isInitialized = true; // 초기화 완료 표시
    setupAutoRefresh();
  }

  // 설정 변경 시 재초기화를 위한 메서드 추가
  static reinit(config: FastAuthConfig) {
    console.log('[FastAuth] FastAuthProvider 재초기화 시작');
    
    // 기존 타이머들 완전 정리
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
      refreshTimeout = null;
      console.log('[FastAuth] refreshTimeout 정리 완료');
    }
    if (alertTimeout) {
      clearTimeout(alertTimeout);
      alertTimeout = null;
      console.log('[FastAuth] alertTimeout 정리 완료');
    }
    if (expiryLogInterval) {
      clearInterval(expiryLogInterval);
      expiryLogInterval = null;
      console.log('[FastAuth] expiryLogInterval 정리 완료');
    }
    
    // 설정 캐시 무효화 (새로운 설정이 즉시 적용되도록)
    if (typeof window !== 'undefined' && (window as any).clearConfigCache) {
      (window as any).clearConfigCache();
    }
    
    // 설정 업데이트
    fastAuthConfig = { ...config };
    console.log('[FastAuth] FastAuthProvider 재초기화 완료, 새로운 설정:', fastAuthConfig);
    
    // 새로운 설정으로 타이머 재설정
    setupAutoRefresh();
  }

  static getConfig(): FastAuthConfig {
    
    return getConfig();
  }

  static async login({ username, password }: { username: string; password: string }) {
    const config = FastAuthProvider.getConfig();
    const res = await fetch(config.baseUrl + config.loginEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('로그인 실패');
    const data = await res.json();
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    FastAuthProvider.disableAlertShown();
    logAccessTokenExpiry();
    if (FastAuthProvider.getConfig().autoRefresh) {
      setupAutoRefresh();
    }
    return data;
  }

  static async loginByCode(code: string) {
    const config = FastAuthProvider.getConfig();
    
    // 필수 설정 유효성 검사
    const configValidation = validateRequiredConfig(['codeLoginEndpoint', 'baseUrl']);
    if (!configValidation.isValid) {
      throw new Error(configValidation.error);
    }
    
    const res = await fetch(config.baseUrl + config.codeLoginEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || '코드 로그인 처리 중 오류가 발생했습니다.');
    }
    
    const data = await res.json();
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    FastAuthProvider.disableAlertShown();
    logAccessTokenExpiry();
    if (FastAuthProvider.getConfig().autoRefresh) {
      setupAutoRefresh();
    }
    return data;
  }

  static async resetPassword(accessToken: string, newPassword: string) {
    const config = FastAuthProvider.getConfig();
    
    // URL 토큰 유효성 검사
    const tokenValidation = validateUrlToken(accessToken);
    if (!tokenValidation.isValid) {
      throw new Error(tokenValidation.error);
    }
    
    // 필수 설정 유효성 검사
    const configValidation = validateRequiredConfig(['passwordResetEndpoint', 'baseUrl']);
    if (!configValidation.isValid) {
      throw new Error(configValidation.error);
    }
    
    const res = await fetch(config.baseUrl + config.passwordResetEndpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ newPassword }),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || '비밀번호 초기화 처리 중 오류가 발생했습니다.');
    }
    
    return await res.json();
  }

  static async logout() {
    const config = FastAuthProvider.getConfig();
    const refreshToken = getRefreshToken();

    // 로그아웃 요청 유효성 검사
    const logoutValidation = validateLogoutRequest();
    if (!logoutValidation.isValid) {
      alert('로그아웃 경로를 지정해 주세요');
      return;
    }
    
    if (!refreshToken) {
      console.log('[FastAuth] Refresh token is missing. Performing client-side logout only.');
      return;
    }
    
    
    try {
      const res = await fetch(`${config.baseUrl}${config.logoutEndpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    
      if (!res.ok) {
        const errorText = await res.text();
        console.error('로그아웃 엔드포인트 호출 실패:', res.status, res.statusText, '응답 본문:', errorText);
        return;
      }
    } catch (error) {
      console.error('로그아웃 엔드포인트 호출 중 오류 발생:', error);
    }

    const afterLogout = (config: FastAuthConfig) => {
      removeAccessToken();
      removeRefreshToken();
      FastAuthProvider.disableAlertShown();
      if (refreshTimeout) clearTimeout(refreshTimeout);

      // 초기화 플래그 리셋 (다음 로그인 시 정상 초기화를 위해)
      isInitialized = false;

      if (config.onTokenExpiredRedirect) {
        if (FastAuthProvider._onTokenExpiredNavigate) {
          FastAuthProvider._onTokenExpiredNavigate(config.onTokenExpiredRedirect);
        } else {
          window.location.href = config.onTokenExpiredRedirect;
        }
      }

    }
    afterLogout(config)
    
  }

  static enableExpiryLog(enable: boolean) {
    enableExpiryLog = enable;
  }

  static resumeSession() {
    if (hasAccessToken()) {
      logAccessTokenExpiry();
      if (FastAuthProvider.getConfig().autoRefresh) {
        setupAutoRefresh();
      }
    }
  }

  private static _onTokenExpiredNavigate: ((path: string) => void) | undefined;
  // onSessionExpiryAlert 제거 - 더 이상 필요 없음

  static handleTokenExpired() {
    const config = FastAuthProvider.getConfig();
    removeAccessToken();
    removeRefreshToken();
    
    // 초기화 플래그 리셋 (다음 로그인 시 정상 초기화를 위해)
    isInitialized = false;
    
    if (config.onTokenExpiredRedirect) {
      if (FastAuthProvider._onTokenExpiredNavigate) {
        FastAuthProvider._onTokenExpiredNavigate(config.onTokenExpiredRedirect);
      } else {
        window.location.href = config.onTokenExpiredRedirect;
      }
    }
  }

  static disableAlertShown() {
    console.log('[FastAuth] disableAlertShown 호출, 이전 상태:', alertShownForThisSession);
    alertShownForThisSession = false;
    console.log('[FastAuth] disableAlertShown 완료, 현재 상태:', alertShownForThisSession);
  }

  static enableAlertShown() {
    console.log('[FastAuth] enableAlertShown 호출, 이전 상태:', alertShownForThisSession);
    alertShownForThisSession = true;
    console.log('[FastAuth] enableAlertShown 완료, 현재 상태:', alertShownForThisSession);
  }
}

export async function fastAuthApiRequest(
  endpoint: string,
  options?: { 
    method?: string; 
    body?: any; 
    withToken?: boolean; 
    headers?: Record<string, string>;
    endpointType?: 'passwordChange' | 'passwordReset' | 'passwordFind' | 'join';
  }
): Promise<any> {
  // API 요청 옵션 유효성 검사
  const optionsValidation = validateApiRequestOptions(options);
  if (!optionsValidation.isValid) {
    throw new Error(optionsValidation.error);
  }

  // 엔드포인트 타입이 지정된 경우 유효성 검사
  if (options?.endpointType) {
    const endpointValidation = validateEndpoint(options.endpointType);
    if (!endpointValidation.isValid) {
      throw new Error(endpointValidation.error);
    }
  }

  const { method = 'GET', body, withToken = true, headers: customHeaders } = options || {};
  // 토큰 기반 요청 유효성 검사
      const tokenValidation = validateToken(false);
  if (!tokenValidation.isValid) {
    if (tokenValidation.error === '토큰이 만료되었습니다.') {
      FastAuthProvider.handleTokenExpired();
    }
    throw new Error(tokenValidation.error);
  }
  
  const config = FastAuthProvider.getConfig();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...customHeaders };
  
  headers['Authorization'] = `Bearer ${getAccessToken()}`;
  const res = await fetch(config.baseUrl + endpoint, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  try {
    return (await handleApiResponse(res, '로그아웃')).body;
  } catch (error) {
    // 응답 본문이 있지만 JSON 파싱에 실패한 경우 (예: 빈 본문이 아니지만 유효한 JSON이 아님)
    console.warn(`[FastAuth] Failed to parse JSON for successful response (status: ${res.status}):`, error);
    return {}; // 이 경우에도 빈 객체를 반환하여 클라이언트에서 오류를 받지 않도록 함
  }
}

// 토큰 갱신 필요 여부를 판단하는 함수
function isTokenExpiringSoon(): boolean {
  if (!hasAccessToken()) return false;
  
  const exp = getAccessTokenExpiration();
  if (!exp) return false;
  
  const now = Date.now();
  // 만료 1분 전 자동 갱신
  return exp - now < 60 * 1000;
}

// 토큰을 실제로 갱신하는 함수
async function refreshToken(): Promise<void> {
  const config = FastAuthProvider.getConfig();
  const refreshToken = getRefreshToken();
  
  // 리프레시 토큰 유효성 검사
  const refreshTokenValidation = validateRefreshToken(refreshToken);
  if (!refreshTokenValidation.isValid) {
    console.log('[FastAuth] No refresh token found, handling token expired.');
    return FastAuthProvider.handleTokenExpired();
  }

  // 토큰 갱신 요청 유효성 검사
  const refreshRequestValidation = validateTokenRefreshRequest();
  if (!refreshRequestValidation.isValid) {
    console.error('[FastAuth] Token refresh endpoint not configured:', refreshRequestValidation.error);
    return FastAuthProvider.handleTokenExpired();
  }

  console.log('[FastAuth] Attempting token refresh. Refresh Token present.');
  console.log('[FastAuth] Refreshing from:', config.baseUrl + config.refreshEndpoint);

  try {
    const res = await fetch(config.baseUrl + config.refreshEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (res.ok) {
      console.log('[FastAuth] Token refresh successful.');
      const data = await res.json();
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      FastAuthProvider.disableAlertShown();
      logAccessTokenExpiry();
      setupAutoRefresh();
    } else {
      const errorText = await res.text();
      console.error('[FastAuth] Token refresh failed:', res.status, res.statusText, '응답 본문:', errorText);
      FastAuthProvider.handleTokenExpired();
    }
  } catch (error) {
    console.error('[FastAuth] Network error during token refresh:', error);
    FastAuthProvider.handleTokenExpired(); // 네트워크 오류 시에도 토큰 만료 처리
  }
}

// 토큰 갱신 필요 여부를 판단하고 필요시 갱신하는 함수
async function checkAndRefreshToken(): Promise<void> {
  if (isTokenExpiringSoon()) {
    await refreshToken();
  } else {
    console.log('[FastAuth] Token not expiring soon, setting up next auto-refresh.');
    setupAutoRefresh();
  }
}

let alertTimeout: ReturnType<typeof setTimeout> | null = null;

// setInterval 내부에 있던 로직을 분리한 도우미 함수
function handleExpiryIntervalTick(initialToken: string, isAutoRefresh: boolean) {
  const { isStaleOrInvalid, exp, remain } = getAccessTokenInfo(initialToken);

  if (isStaleOrInvalid) {
    clearInterval(expiryLogInterval!);
    expiryLogInterval = null;
    logAccessTokenExpiry(); // 새로운 토큰으로 타이머 재설정 시도
    return;
  }
  
  if (!exp) {
    clearInterval(expiryLogInterval!);
    expiryLogInterval = null;
    return;
  }
  
  const alertBeforeSec = getSessionExpiryAlertSec();
  if (isAutoRefresh) {
  } else {
    if (!alertShownForThisSession && remain !== null && remain <= alertBeforeSec) {
      showSessionExpiryAlert(); // enableAlertShown 호출 제거
    }
  }
  if (remain !== null && remain <= 0) {
    clearInterval(expiryLogInterval!);
    expiryLogInterval = null;
  }
}

function logAccessTokenExpiry() {
  if (expiryLogInterval) clearInterval(expiryLogInterval);
  if (!hasAccessToken()) return;
  
  const initialToken = getAccessToken() as string; // setInterval이 시작될 때의 토큰 스냅샷
  const config = getConfig(); // 항상 최신 설정을 가져오기 위해 getConfig() 직접 사용

  expiryLogInterval = setInterval(() => handleExpiryIntervalTick(initialToken, config.autoRefresh), 2000);
}

function setupAutoRefresh() {
  if (refreshTimeout) clearTimeout(refreshTimeout);
  if (alertTimeout) clearTimeout(alertTimeout);
  
  // 항상 최신 설정을 가져오기 위해 getConfig() 강제 새로고침 사용
  const config = getConfig(true); // 강제 새로고침으로 최신 설정 가져오기
  console.log('[FastAuth] setupAutoRefresh - 현재 설정:', {
    autoRefresh: config.autoRefresh,
    sessionExpiryAlertEnabled: config.sessionExpiryAlertEnabled,
    sessionExpiryAlertSec: config.sessionExpiryAlertSec,
    refreshBeforeExpirySec: config.refreshBeforeExpirySec
  });
  
  if (!hasAccessToken()) return;
  const exp = getAccessTokenExpiration();
  if (!exp) return;
  const now = Date.now();
  if (exp - now <= 0) {
    // 이미 만료된 토큰이면 아무것도 하지 않음
    return;
  }
  logAccessTokenExpiry();
  const refreshBeforeSec = getRefreshBeforeExpirySec();
  const alertBeforeSec = getSessionExpiryAlertSec();
  const alertEnabled = getSessionExpiryAlertEnabled();
  const msToRefresh = config.autoRefresh ? exp - now - refreshBeforeSec * 1000 : null;
  const msToAlert = (!config.autoRefresh && alertEnabled) ? exp - now - alertBeforeSec * 1000 : null;
  
  if (msToAlert !== null && msToAlert > 1000) {
    console.log('[fast-auth] 알림 타이머 설정:', msToAlert, 'ms 후 (설정값:', alertBeforeSec, '초)');
    alertTimeout = setTimeout(showSessionExpiryAlert, msToAlert);
  } else if (msToAlert !== null && msToAlert <= 1000) {
    console.log('[fast-auth] 알림 즉시 실행 (설정값:', alertBeforeSec, '초)');
    showSessionExpiryAlert();
  }
  if (msToRefresh !== null && msToRefresh > 0) {
    refreshTimeout = setTimeout(checkAndRefreshToken, msToRefresh);
  } else if (msToRefresh !== null) {
    checkAndRefreshToken();
  }
}

function showSessionExpiryAlert() {
  console.log('[FastAuth] showSessionExpiryAlert 진입, alertShownForThisSession:', alertShownForThisSession);

  if (alertShownForThisSession) {
    console.log('[FastAuth] 이미 알림을 띄웠으므로 return');
    return;
  }
  
  FastAuthProvider.enableAlertShown();
  console.log('[FastAuth] enableAlertShown 호출 완료');
  
  if (expiryLogInterval) {
    clearInterval(expiryLogInterval);
    expiryLogInterval = null;
  }
  
  // 전역 상태로 다이얼로그 표시
  setSessionExpiryDialogState(true, refreshToken, FastAuthProvider.handleTokenExpired);
  console.log('[FastAuth] 다이얼로그 상태 설정 완료');
}

// 앱이 시작될 때 accessToken이 있으면 만료 전까지 로그만 출력 (초기화 여부와 무관)
if (typeof window !== 'undefined') {
  logAccessTokenExpiry();
  
  // 디버깅을 위한 전역 함수 추가
  (window as any).resetAlertShownFlag = () => {
    alertShownForThisSession = false;
    console.log('[FastAuth] alertShownForThisSession 플래그가 수동으로 리셋되었습니다.');
  };
  
  (window as any).checkAlertShownFlag = () => {
    console.log('[FastAuth] alertShownForThisSession 현재 상태:', alertShownForThisSession);
  };
  
  // 설정 캐시 무효화 함수를 전역으로 노출
  (window as any).clearConfigCache = () => {
    // config.ts의 clearConfigCache 함수 호출
    if (typeof window !== 'undefined' && (window as any).__clearConfigCache) {
      (window as any).__clearConfigCache();
    }
  };
}

export { setupAutoRefresh };

// validator 함수들 export
export * from './validator';
export { 
  checkAndRefreshToken, 
  isTokenExpiringSoon, 
  refreshToken,
  validateToken,
  validateUrlToken,
  validateEndpoint,
  validateAuthCode
}; 