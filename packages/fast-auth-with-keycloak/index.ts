// fast-auth-with-keycloak 패키지 진입점

import { setAccessToken, removeAccessToken, getAccessToken, getTokenExpiration, setRefreshToken, removeRefreshToken, getRefreshToken } from './token';

export type FastAuthConfig = {
  baseUrl: string;
  loginEndpoint: string;
  refreshEndpoint: string;
  autoRefresh?: boolean;
  onTokenExpiredRedirect?: string;
  logoutEndpoint?: string;
};

let fastAuthConfig: FastAuthConfig | null = null;
let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
let expiryLogInterval: ReturnType<typeof setInterval> | null = null;
let enableExpiryLog = true;
let alertShown = false;

export class FastAuthProvider {
  static init(config: FastAuthConfig) {
    fastAuthConfig = { ...config };
    // console.log('[FastAuth] FastAuthProvider initialized with config:', fastAuthConfig);
  }

  static getConfig(): FastAuthConfig {
    if (!fastAuthConfig) {
      // fastAuthConfig가 초기화되지 않은 경우 localStorage에서 로드 시도
      const savedConfig = localStorage.getItem('fast-auth-init-config');
      if (savedConfig) {
        try {
          FastAuthProvider.init(JSON.parse(savedConfig));
        } catch (e) {
          console.error("[FastAuth] Failed to re-initialize FastAuthProvider from localStorage in getConfig:", e);
          // 파싱 실패 시에도 여전히 초기화되지 않은 상태
        }
      }
    }
    
    if (!fastAuthConfig) {
      throw new Error('FastAuthProvider가 초기화되지 않았습니다.');
    }
    return fastAuthConfig;
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
    resetAlertShown();
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
    resetAlertShown();
    if (refreshTimeout) clearTimeout(refreshTimeout);

    if (config.onTokenExpiredRedirect) {
      window.location.href = config.onTokenExpiredRedirect;
    }
  }

  static enableExpiryLog(enable: boolean) {
    enableExpiryLog = enable;
  }

  static resumeSession() {
    const token = getAccessToken();
    if (token) {
      logAccessTokenExpiry();
      if (FastAuthProvider.getConfig().autoRefresh) {
        setupAutoRefresh();
      }
    }
  }
}

export async function fastAuthApiRequest(
  endpoint: string,
  options?: { method?: string; body?: any; withToken?: boolean }
): Promise<any> {
  const config = FastAuthProvider.getConfig();
  const { method = 'GET', body, withToken = true } = options || {};
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (withToken) {
    const token = getAccessToken();
    if (!token) throw new Error('토큰이 없습니다.');
    const exp = getTokenExpiration(token);
    if (!exp || Date.now() > exp) {
      handleTokenExpired();
      throw new Error('토큰이 만료되었습니다.');
    }
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(config.baseUrl + endpoint, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error('API 요청 실패');
  return res.json();
}

function handleTokenExpired() {
  const config = FastAuthProvider.getConfig();
  removeAccessToken();
  removeRefreshToken();
  if (config.onTokenExpiredRedirect) {
    window.location.href = config.onTokenExpiredRedirect;
  }
}

async function refreshTokenIfNeeded() {
  const config = FastAuthProvider.getConfig();
  const token = getAccessToken();
  if (!token) return;
  const exp = getTokenExpiration(token);
  if (!exp) return;
  const now = Date.now();
  // 만료 1분 전 자동 갱신
  if (exp - now < 60 * 1000) {
    const refreshToken = localStorage.getItem('fast-auth-refresh-token');
    if (!refreshToken) {
      console.log('[FastAuth] No refresh token found, handling token expired.');
      return handleTokenExpired();
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
        resetAlertShown();
        logAccessTokenExpiry();
        setupAutoRefresh();
      } else {
        const errorText = await res.text();
        console.error('[FastAuth] Token refresh failed:', res.status, res.statusText, '응답 본문:', errorText);
        handleTokenExpired();
      }
    } catch (error) {
      console.error('[FastAuth] Network error during token refresh:', error);
      handleTokenExpired(); // 네트워크 오류 시에도 토큰 만료 처리
    }
  } else {
    console.log('[FastAuth] Token not expiring soon, setting up next auto-refresh.');
    setupAutoRefresh();
  }
}

function getRefreshBeforeExpirySec() {
  const saved = localStorage.getItem('fast-auth-init-config');
  if (saved) {
    try {
      const config = JSON.parse(saved);
      return Number(config.refreshBeforeExpirySec) || 1;
    } catch {}
  }
  return 1;
}

function getSessionExpiryAlertSec() {
  const saved = localStorage.getItem('fast-auth-init-config');
  if (saved) {
    try {
      const config = JSON.parse(saved);
      return Number(config.sessionExpiryAlertSec) || 30;
    } catch {}
  }
  return 30;
}

function getSessionExpiryAlertEnabled() {
  const saved = localStorage.getItem('fast-auth-init-config');
  if (saved) {
    try {
      const config = JSON.parse(saved);
      return !!config.sessionExpiryAlertEnabled;
    } catch {}
  }
  return false;
}

let alertTimeout: ReturnType<typeof setTimeout> | null = null;

function logAccessTokenExpiry() {
  if (expiryLogInterval) clearInterval(expiryLogInterval);
  const token = getAccessToken();
  if (!token) return;
  let alertShown = false;
  expiryLogInterval = setInterval(() => {
    const currentToken = getAccessToken();
    if (currentToken !== token) {
      clearInterval(expiryLogInterval!);
      expiryLogInterval = null;
      logAccessTokenExpiry();
      return;
    }
    const exp = getTokenExpiration(token);
    if (!exp) {
      clearInterval(expiryLogInterval!);
      expiryLogInterval = null;
      return;
    }
    const now = Date.now();
    const remain = Math.max(0, Math.floor((exp - now) / 1000));
    const alertBeforeSec = getSessionExpiryAlertSec();
    const msToAlert = exp - now - alertBeforeSec * 1000;
    const config = FastAuthProvider.getConfig();
    if (config.autoRefresh) {
      console.log(`[fast-auth] accessToken 만료까지 남은 시간: ${remain}초`, {
        exp,
        now,
        alertBeforeSec,
        msToAlert
      });
    } else {
      console.log(`[fast-auth] accessToken 만료까지 남은 시간: ${remain}초`, {
        exp,
        now,
        alertBeforeSec,
        msToAlert
      });
      if (!alertShown && remain <= alertBeforeSec) {
        alertShown = true;
        showSessionExpiryAlert();
      }
    }
    if (remain <= 0) {
      clearInterval(expiryLogInterval!);
      expiryLogInterval = null;
    }
  }, 2000);
}

function setupAutoRefresh() {
  if (refreshTimeout) clearTimeout(refreshTimeout);
  if (alertTimeout) clearTimeout(alertTimeout);
  const config = FastAuthProvider.getConfig();
  const token = getAccessToken();
  if (!token) return;
  const exp = getTokenExpiration(token);
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
  console.log('[fast-auth] setupAutoRefresh', {
    autoRefresh: config.autoRefresh,
    alertEnabled,
    exp,
    now,
    alertBeforeSec,
    refreshBeforeSec,
    msToAlert,
    msToRefresh
  });
  if (msToAlert !== null && msToAlert > 1000) {
    console.log('[fast-auth] 알림 타이머 설정:', msToAlert, 'ms 후');
    alertTimeout = setTimeout(showSessionExpiryAlert, msToAlert);
  } else if (msToAlert !== null && msToAlert <= 1000) {
    console.log('[fast-auth] 알림 즉시 실행');
    showSessionExpiryAlert();
  }
  if (msToRefresh !== null && msToRefresh > 0) {
    refreshTimeout = setTimeout(refreshTokenIfNeeded, msToRefresh);
  } else if (msToRefresh !== null) {
    refreshTokenIfNeeded();
  }
}

function showSessionExpiryAlert() {
  if (alertShown) return;
  alertShown = true;
  console.log('[fast-auth] showSessionExpiryAlert 호출');
  if (expiryLogInterval) {
    clearInterval(expiryLogInterval);
    expiryLogInterval = null;
  }
  if (window.confirm('로그인 세션이 만료됩니다. 연장하시겠습니까?')) {
    refreshTokenIfNeeded();
  }
}

// accessToken이 갱신되거나 로그아웃 시 alertShown을 false로 초기화
function resetAlertShown() {
  alertShown = false;
}

// 앱이 시작될 때 accessToken이 있으면 만료 전까지 로그만 출력 (초기화 여부와 무관)
if (typeof window !== 'undefined') {
  const token = getAccessToken();
  if (token) {
    if (expiryLogInterval) clearInterval(expiryLogInterval);
    expiryLogInterval = setInterval(() => {
      const exp = getTokenExpiration(token);
      if (!exp) {
        clearInterval(expiryLogInterval!);
        expiryLogInterval = null;
        return;
      }
      const now = Date.now();
      const remain = Math.max(0, Math.floor((exp - now) / 1000));
      console.log(`[fast-auth] accessToken 만료까지 남은 시간: ${remain}초`);
      if (remain <= 0) {
        clearInterval(expiryLogInterval!);
        expiryLogInterval = null;
      }
    }, 2000);
  }
}

export { setupAutoRefresh }; 