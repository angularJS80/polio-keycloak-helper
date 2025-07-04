// fast-auth-with-keycloak 패키지 진입점

import { setAccessToken, removeAccessToken, getAccessToken, getTokenExpiration, setRefreshToken, removeRefreshToken, getRefreshToken, hasAccessToken, isAccessTokenStaleOrInvalid, getAccessTokenInfo } from './token';
import { getAccessTokenExpiration } from './token';
import { getConfig, getRefreshBeforeExpirySec, getSessionExpiryAlertSec, getSessionExpiryAlertEnabled, } from './config';

export type FastAuthConfig = {
  baseUrl: string;
  loginEndpoint: string;
  refreshEndpoint: string;
  autoRefresh: boolean;
  onTokenExpiredRedirect?: string;
  logoutEndpoint?: string;
  onTokenExpiredNavigate?: (path: string) => void;
  onSessionExpiryAlert?: (onExtend: () => void, onLogout: () => void) => void;
};

let fastAuthConfig: FastAuthConfig | null = null;
let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
let expiryLogInterval: ReturnType<typeof setInterval> | null = null;
let enableExpiryLog = true;
let alertShownForThisSession = false;
let isInitialized = false; // 초기화 플래그 추가

export class FastAuthProvider {
  static init(config: FastAuthConfig) {
    // 이미 초기화되었다면 중복 실행 방지
    if (isInitialized) {
      console.log('[FastAuth] 이미 초기화되어 있음, 중복 실행 방지');
      return;
    }
    
    fastAuthConfig = { ...config };
    console.log('[FastAuth] FastAuthProvider initialized with config:', fastAuthConfig);
    if (config.onTokenExpiredNavigate) {
      FastAuthProvider._onTokenExpiredNavigate = config.onTokenExpiredNavigate;
      console.log('[FastAuth] onTokenExpiredNavigate 콜백 등록됨');
    }
    if (config.onSessionExpiryAlert) {
      FastAuthProvider._onSessionExpiryAlert = config.onSessionExpiryAlert;
      console.log('[FastAuth] onSessionExpiryAlert 콜백 등록됨');
    } else {
      console.log('[FastAuth] onSessionExpiryAlert 콜백이 등록되지 않음');
    }
    
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

  static async logout() {
    const config = FastAuthProvider.getConfig();
    const refreshToken = getRefreshToken();

    if (!config.logoutEndpoint) {
      console.warn('[FastAuth] Logout endpoint is not defined in FastAuthConfig. Displaying alert.');
      alert('로그아웃 경로를 지정해 주세요');
    }

    if (config.logoutEndpoint && refreshToken) {
      try {
        const res = await fetch(config.baseUrl + config.logoutEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          console.error('로그아웃 엔드포인트 호출 실패:', res.status, res.statusText, '응답 본문:', errorText);
          return; // API 호출 실패 시 클라이언트 측 로그아웃을 진행하지 않고 함수 종료
        }
      } catch (error) {
        console.error('로그아웃 엔드포인트 호출 중 오류 발생:', error);
        return; // 네트워크 오류 시에도 클라이언트 측 로그아웃을 진행하지 않고 함수 종료
      }
    } else {
      console.log('[FastAuth] Logout endpoint or refresh token missing. Performing client-side logout only.');
    }

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
  static _onSessionExpiryAlert: ((onExtend: () => void, onLogout: () => void) => void) | undefined;

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
  options?: { method?: string; body?: any; withToken?: boolean; headers?: Record<string, string> }
): Promise<any> {
  const config = FastAuthProvider.getConfig();
  const { method = 'GET', body, withToken = true, headers: customHeaders } = options || {};
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...customHeaders };
  if (withToken) {
    if (!hasAccessToken()) throw new Error('토큰이 없습니다.');
    const token = getAccessToken() as string; // hasAccessToken()이 true이므로 string으로 단언
    const exp = getAccessTokenExpiration();
    if (!exp || Date.now() > exp) {
      FastAuthProvider.handleTokenExpired();
      throw new Error('토큰이 만료되었습니다.');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(config.baseUrl + endpoint, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    // API 요청 실패 시 응답 본문을 텍스트로 읽어 오류 메시지에 포함
    const errorText = await res.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(`API 요청 실패: ${errorJson.message || errorText}`);
    } catch {
      throw new Error(`API 요청 실패: ${errorText || res.statusText}`);
    }
  }

  // 응답 본문이 비어있을 수 있는 경우를 처리 (예: HTTP 204 No Content)
  const contentLength = res.headers.get('content-length');
  if (res.status === 204 || (contentLength === '0')) {
    return {}; // 본문이 없는 경우 빈 객체 반환
  }

  try {
    return await res.json();
  } catch (error) {
    // 응답 본문이 있지만 JSON 파싱에 실패한 경우 (예: 빈 본문이 아니지만 유효한 JSON이 아님)
    console.warn(`[FastAuth] Failed to parse JSON for successful response (status: ${res.status}):`, error);
    return {}; // 이 경우에도 빈 객체를 반환하여 클라이언트에서 오류를 받지 않도록 함
  }
}

async function refreshTokenIfNeeded() {
  const config = FastAuthProvider.getConfig();
  if (!hasAccessToken()) return;
  const token = getAccessToken() as string; // hasAccessToken()이 true이므로 string으로 단언
  const exp = getAccessTokenExpiration();
  if (!exp) return;
  const now = Date.now();
  // 만료 1분 전 자동 갱신
  if (exp - now < 60 * 1000) {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      console.log('[FastAuth] No refresh token found, handling token expired.');
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
  const token = getAccessToken() as string; // hasAccessToken()이 true이므로 string으로 단언
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
    refreshTimeout = setTimeout(refreshTokenIfNeeded, msToRefresh);
  } else if (msToRefresh !== null) {
    refreshTokenIfNeeded();
  }
}

function showSessionExpiryAlert() {
  console.log('[FastAuth] showSessionExpiryAlert 진입, alertShownForThisSession:', alertShownForThisSession);
  console.log('[FastAuth] _onSessionExpiryAlert 콜백 존재:', !!FastAuthProvider._onSessionExpiryAlert);

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
  
  if (FastAuthProvider._onSessionExpiryAlert) {
    console.log('[FastAuth] 등록된 콜백 실행');
    FastAuthProvider._onSessionExpiryAlert(refreshTokenIfNeeded, FastAuthProvider.handleTokenExpired);
    // 콜백이 등록되어 있으면 여기서 종료 (fallback 실행하지 않음)
    return;
  } else {
    console.log('[FastAuth] 등록된 콜백이 없어서 fallback 실행');
    // fallback for environments where alert cannot be shown or callback not provided
    if (window.confirm('로그인 세션이 만료됩니다. 연장하시겠습니까?')) {
      refreshTokenIfNeeded();
    } else {
      FastAuthProvider.handleTokenExpired();
    }
  }
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
export { refreshTokenIfNeeded }; 