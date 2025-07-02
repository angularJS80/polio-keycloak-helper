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

export function decodeToken(token: string): any | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
} 