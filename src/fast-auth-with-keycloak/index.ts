// fast-auth-with-keycloak 패키지 진입점

import { setAccessToken, removeAccessToken, getAccessToken, getTokenExpiration, setRefreshToken, removeRefreshToken } from './token';

export type FastAuthConfig = {
  baseUrl: string;
  loginEndpoint: string;
  refreshEndpoint: string;
  autoRefresh?: boolean;
  onTokenExpiredRedirect?: string;
};

let fastAuthConfig: FastAuthConfig | null = null;
let refreshTimeout: ReturnType<typeof setTimeout> | null = null;

export class FastAuthProvider {
  static init(config: FastAuthConfig) {
    fastAuthConfig = { ...config };
  }

  static getConfig(): FastAuthConfig {
    if (!fastAuthConfig) throw new Error('FastAuthProvider가 초기화되지 않았습니다.');
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
    if (FastAuthProvider.getConfig().autoRefresh) {
      setupAutoRefresh();
    }
    return data;
  }

  static logout() {
    removeAccessToken();
    removeRefreshToken();
    if (refreshTimeout) clearTimeout(refreshTimeout);
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
    if (!refreshToken) return handleTokenExpired();
    const res = await fetch(config.baseUrl + config.refreshEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (res.ok) {
      const data = await res.json();
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      setupAutoRefresh();
    } else {
      handleTokenExpired();
    }
  } else {
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

function setupAutoRefresh() {
  if (refreshTimeout) clearTimeout(refreshTimeout);
  const config = FastAuthProvider.getConfig();
  if (!config.autoRefresh) return;
  const token = getAccessToken();
  if (!token) return;
  const exp = getTokenExpiration(token);
  if (!exp) return;
  const now = Date.now();
  const refreshBeforeSec = getRefreshBeforeExpirySec();
  const ms = exp - now - refreshBeforeSec * 1000;
  if (ms > 0) {
    refreshTimeout = setTimeout(refreshTokenIfNeeded, ms);
  } else {
    refreshTokenIfNeeded();
  }
} 