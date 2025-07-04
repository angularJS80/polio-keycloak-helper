import { setItem, getItem, removeItem } from './storage';

// fast-auth-with-keycloak 토큰 유틸리티

const ACCESS_TOKEN_KEY = 'fast-auth-token';
const REFRESH_TOKEN_KEY = 'fast-auth-refresh-token';

export function setAccessToken(token: string) {
  setItem('session', ACCESS_TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
  return getItem('session', ACCESS_TOKEN_KEY);
}

export function hasAccessToken(): boolean {
  return !!getAccessToken();
}

export function removeAccessToken() {
  removeItem('session', ACCESS_TOKEN_KEY);
}

export function setRefreshToken(token: string) {
  setItem('local', REFRESH_TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  return getItem('local', REFRESH_TOKEN_KEY);
}

export function removeRefreshToken() {
  removeItem('local', REFRESH_TOKEN_KEY);
}

export function getTokenExpiration(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp ? payload.exp * 1000 : null; // ms 단위로 반환
  } catch {
    return null;
  }
}

export function  isTokenExpired(){
  const exp = getAccessTokenExpiration();
  return !exp || Date.now() > exp
}

export function decodeToken(token: string): any | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

export function getUserName(): string | null {
  const token = getAccessToken();
  if (!token) {
    return null;
  }
  const decoded = decodeToken(token);
  if (decoded) {
    if (decoded.preferred_username) {
      return decoded.preferred_username;
    } else if (decoded.username) {
      return decoded.username;
    }
  }
  return null;
}

export function getEmail(): string | null {

  const token = getAccessToken();
  if (!token) {
    return null;
  }
  const decoded = decodeToken(token);
  if (decoded) {
    return decoded.email || null;
  }
  return null;
}

export function getAccessTokenExpiration(): number | null {
  const token = getAccessToken();
  if (!token) {
    return null;
  }
  return getTokenExpiration(token);
}

export function isAccessTokenExpiration(): number | null {
  const token = getAccessToken();
  if (!token) {
    return null;
  }
  return getTokenExpiration(token);
}

export function isAccessTokenStaleOrInvalid(initialToken: string): boolean {
  const currentToken = getAccessToken();
  return !hasAccessToken() || currentToken !== initialToken;
}

export type AccessTokenInfo = {
  exp: number | null;
  isStaleOrInvalid: boolean;
  remain: number | null;
};

export function getAccessTokenInfo(initialToken: string): AccessTokenInfo {
  const isStaleOrInvalid = isAccessTokenStaleOrInvalid(initialToken);
  let exp: number | null = null;
  let remain: number | null = null;

  if (!isStaleOrInvalid) {
    exp = getAccessTokenExpiration();
    if (exp) {
      const now = Date.now();
      remain = Math.max(0, Math.floor((exp - now) / 1000));
    }
  }

  return {
    exp,
    isStaleOrInvalid,
    remain,
  };
} 