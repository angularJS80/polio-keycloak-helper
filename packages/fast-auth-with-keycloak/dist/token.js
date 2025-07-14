import { setItem, getItem, removeItem } from './storage';
// fast-auth-with-keycloak 토큰 유틸리티
const ACCESS_TOKEN_KEY = 'fast-auth-token';
const REFRESH_TOKEN_KEY = 'fast-auth-refresh-token';
export function setAccessToken(token) {
    setItem('session', ACCESS_TOKEN_KEY, token);
}
export function getAccessToken() {
    return getItem('session', ACCESS_TOKEN_KEY);
}
export function hasAccessToken() {
    return !!getAccessToken();
}
export function removeAccessToken() {
    removeItem('session', ACCESS_TOKEN_KEY);
}
export function setRefreshToken(token) {
    setItem('local', REFRESH_TOKEN_KEY, token);
}
export function getRefreshToken() {
    return getItem('local', REFRESH_TOKEN_KEY);
}
export function removeRefreshToken() {
    removeItem('local', REFRESH_TOKEN_KEY);
}
export function getTokenExpiration(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp ? payload.exp * 1000 : null; // ms 단위로 반환
    }
    catch {
        return null;
    }
}
export function isTokenExpired() {
    const exp = getAccessTokenExpiration();
    return !exp || Date.now() > exp;
}
export function decodeToken(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
    }
    catch {
        return null;
    }
}
export function getUserName() {
    const token = getAccessToken();
    if (!token) {
        return null;
    }
    const decoded = decodeToken(token);
    if (decoded) {
        if (decoded.preferred_username) {
            return decoded.preferred_username;
        }
        else if (decoded.username) {
            return decoded.username;
        }
    }
    return null;
}
export function getEmail() {
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
export function getAccessTokenExpiration() {
    const token = getAccessToken();
    if (!token) {
        return null;
    }
    return getTokenExpiration(token);
}
export function isAccessTokenExpiration() {
    const token = getAccessToken();
    if (!token) {
        return null;
    }
    return getTokenExpiration(token);
}
export function isAccessTokenStaleOrInvalid(initialToken) {
    const currentToken = getAccessToken();
    return !hasAccessToken() || currentToken !== initialToken;
}
export function getAccessTokenInfo(initialToken) {
    const isStaleOrInvalid = isAccessTokenStaleOrInvalid(initialToken);
    let exp = null;
    let remain = null;
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
export function isTokenExpiringSoon() {
    if (!hasAccessToken())
        return false;
    const exp = getAccessTokenExpiration();
    if (!exp)
        return false;
    const now = Date.now();
    // 만료 1분 전 자동 갱신
    return exp - now < 60 * 1000;
}
