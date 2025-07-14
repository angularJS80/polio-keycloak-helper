import { getItem } from './storage';
let initialized = false;
export function setInitialized(enable) {
    initialized = enable;
}
export function isInitialized() {
    return initialized;
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
    sessionExpirypublishEnabled: false,
    sessionExpiryPublishSec: 20
};
export const endpointMeta = {
    login: { name: '로그인', isValid: hasLoginEndpoint, apiUri: getLoginUri },
    passwordChange: { name: '비밀번호 변경', isValid: hasPasswordChangeEndpoint, apiUri: getPasswordChangeUri },
    passwordReset: { name: '비밀번호 초기화', isValid: hasPasswordResetEndpoint, apiUri: getPasswordResetUri },
    passwordFind: { name: '비밀번호 찾기', isValid: hasPasswordFindEndpoint, apiUri: getPasswordFindUri },
    join: { name: '계정 등록', isValid: hasJoinEndpoint, apiUri: getJoinUri },
    logout: { name: '로그아웃', isValid: hasLogoutEndpoint, apiUri: getLogoutUri },
    refresh: { name: '토큰 갱신', isValid: hasRefreshEndpoint, apiUri: getRefreshUri },
    socialLogin: { name: '소셜 로그인', isValid: hasSocialLoginEndpoint, apiUri: getSocialLoginUri },
    loginByCode: { name: '코드 로그인', isValid: hasLoginByCodeEndpoint, apiUri: getLoginByCodeUri },
};
let _cachedConfig = null;
// 캐시를 무효화하는 함수 추가
export function clearConfigCache() {
    _cachedConfig = null;
    console.log('[Config] 설정 캐시가 무효화되었습니다.');
}
function _config() {
    const saved = getItem('local', 'fast-auth-config');
    if (saved) {
        try {
            const parsedConfig = JSON.parse(saved);
            console.log('[Config] 로컬 스토리지에서 설정 로드:', parsedConfig);
            return parsedConfig;
        }
        catch {
            // JSON 파싱 오류 발생 시 기본값 반환
            console.log('[Config] JSON 파싱 오류, 기본값 사용');
            return { ...DEFAULT_INIT_AUTH_CONFIG };
        }
    }
    // 저장된 설정이 없으면 기본값 반환
    console.log('[Config] 저장된 설정 없음, 기본값 사용');
    return { ...DEFAULT_INIT_AUTH_CONFIG };
}
export function getConfig(forceRefresh = false) {
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
export function getSessionExpiryPublishSec() {
    return Number(getConfig().sessionExpiryPublishSec) || 30;
}
export function getSessionExpirypublishEnabled() {
    return !!getConfig().sessionExpirypublishEnabled;
}
export function getJoinEndpoint() {
    return getConfig().joinEndpoint || DEFAULT_INIT_AUTH_CONFIG.joinEndpoint || '/join';
}
export function hasJoinEndpoint() {
    return !!getJoinEndpoint();
}
export function getPasswordChangeEndpoint() {
    return getConfig().passwordChangeEndpoint || DEFAULT_INIT_AUTH_CONFIG.passwordChangeEndpoint || '';
}
export function hasPasswordChangeEndpoint() {
    return !!getPasswordChangeEndpoint();
}
export function getPasswordFindEndpoint() {
    return getConfig().passwordFindEndpoint || DEFAULT_INIT_AUTH_CONFIG.passwordFindEndpoint || '';
}
export function hasPasswordFindEndpoint() {
    return !!getPasswordFindEndpoint();
}
export function getPasswordResetEndpoint() {
    return getConfig().passwordResetEndpoint || DEFAULT_INIT_AUTH_CONFIG.passwordResetEndpoint || '';
}
export function hasPasswordResetEndpoint() {
    return !!getPasswordResetEndpoint();
}
export function getSocialLoginEndpoint() {
    return getConfig().socialLoginEndpoint || DEFAULT_INIT_AUTH_CONFIG.socialLoginEndpoint || '';
}
export function hasSocialLoginEndpoint() {
    return !!getSocialLoginEndpoint();
}
export function getLoginByCodeEndpoint() {
    return getConfig().loginByCodeEndpoint || DEFAULT_INIT_AUTH_CONFIG.loginByCodeEndpoint || '';
}
export function hasLoginByCodeEndpoint() {
    return !!getLoginByCodeEndpoint();
}
export function getLogoutEndpoint() {
    return getConfig().logoutEndpoint || DEFAULT_INIT_AUTH_CONFIG.logoutEndpoint || '';
}
export function getLoginEndpoint() {
    return getConfig().loginEndpoint || DEFAULT_INIT_AUTH_CONFIG.loginByCodeEndpoint || '';
}
export function hasLogoutEndpoint() {
    return !!getLogoutEndpoint();
}
export function hasLoginEndpoint() {
    return !!getLoginEndpoint();
}
export function getRefreshEndpoint() {
    return getConfig().refreshEndpoint || DEFAULT_INIT_AUTH_CONFIG.refreshEndpoint || '';
}
export function hasRefreshEndpoint() {
    return !!getRefreshEndpoint();
}
export function getRedirectConfig() {
    return {
        redirectAfterLogin: !!getConfig().redirectAfterLogin,
        redirectPath: getConfig().redirectPath || DEFAULT_INIT_AUTH_CONFIG.onTokenExpiredRedirect || '/welcome',
    };
}
export function getJoinUri() {
    return (getConfig().baseUrl || '') + getJoinEndpoint();
}
export function getPasswordChangeUri() {
    return (getConfig().baseUrl || '') + getPasswordChangeEndpoint();
}
export function getPasswordFindUri() {
    return (getConfig().baseUrl || '') + getPasswordFindEndpoint();
}
export function getPasswordResetUri() {
    return (getConfig().baseUrl || '') + getPasswordResetEndpoint();
}
export function getSocialLoginUri() {
    return (getConfig().baseUrl || '') + getSocialLoginEndpoint();
}
export function getLoginByCodeUri() {
    return (getConfig().baseUrl || '') + getLoginByCodeEndpoint();
}
export function getLogoutUri() {
    return (getConfig().baseUrl || '') + getLogoutEndpoint();
}
export function getLoginUri() {
    return (getConfig().baseUrl || '') + getLoginEndpoint();
}
export function getRefreshUri() {
    return (getConfig().baseUrl || '') + getRefreshEndpoint();
}
