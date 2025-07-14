'use strict';

const getStorage = (type) => {
    return type === 'local' ? localStorage : sessionStorage;
};
const setItem = (type, key, value) => {
    getStorage(type).setItem(key, value);
};
const getItem = (type, key) => {
    return getStorage(type).getItem(key);
};
const removeItem = (type, key) => {
    getStorage(type).removeItem(key);
};

// fast-auth-with-keycloak 토큰 유틸리티
const ACCESS_TOKEN_KEY = 'fast-auth-token';
const REFRESH_TOKEN_KEY = 'fast-auth-refresh-token';
function setAccessToken(token) {
    setItem('session', ACCESS_TOKEN_KEY, token);
}
function getAccessToken() {
    return getItem('session', ACCESS_TOKEN_KEY);
}
function hasAccessToken() {
    return !!getAccessToken();
}
function removeAccessToken() {
    removeItem('session', ACCESS_TOKEN_KEY);
}
function setRefreshToken(token) {
    setItem('local', REFRESH_TOKEN_KEY, token);
}
function getRefreshToken() {
    return getItem('local', REFRESH_TOKEN_KEY);
}
function removeRefreshToken() {
    removeItem('local', REFRESH_TOKEN_KEY);
}
function getTokenExpiration(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp ? payload.exp * 1000 : null; // ms 단위로 반환
    }
    catch {
        return null;
    }
}
function isTokenExpired() {
    const exp = getAccessTokenExpiration();
    return !exp || Date.now() > exp;
}
function decodeToken(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload;
    }
    catch {
        return null;
    }
}
function getUserName() {
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
function getEmail() {
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
function getAccessTokenExpiration() {
    const token = getAccessToken();
    if (!token) {
        return null;
    }
    return getTokenExpiration(token);
}
function isAccessTokenStaleOrInvalid(initialToken) {
    const currentToken = getAccessToken();
    return !hasAccessToken() || currentToken !== initialToken;
}
function getAccessTokenInfo(initialToken) {
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
function isTokenExpiringSoon() {
    if (!hasAccessToken())
        return false;
    const exp = getAccessTokenExpiration();
    if (!exp)
        return false;
    const now = Date.now();
    // 만료 1분 전 자동 갱신
    return exp - now < 60 * 1000;
}

/**
 * API 응답을 처리하고 성공 또는 실패에 따라 적절한 데이터를 반환하거나 에러를 던집니다.
 * @param res fetch API 응답 객체
 * @param operationName 수행된 작업명 (예: '로그인', '비밀번호 변경' 등)
 * @returns Promise<{ body: any; status: number; message: string; }>
 * @throws Error API 응답이 실패 상태일 경우 에러 객체를 던집니다.
 */
async function handleApiResponse(res, operationName) {
    let errorJson = {};
    let errorText = res.statusText || '알 수 없는 오류가 발생했습니다.';
    try {
        // 응답 본문이 비어있지 않고 JSON 파싱이 가능하다면 시도
        const text = await res.text();
        if (text) {
            errorJson = JSON.parse(text);
            // 서버에서 보낸 에러 메시지가 있다면 사용
            errorText = errorJson.message || errorJson.error || errorJson.detail || errorText;
        }
    }
    catch (e) {
        // JSON 파싱 실패 시, 본문이 JSON이 아니거나 비어있을 수 있음
        console.warn(`[handleApiResponse] Failed to parse error response body as JSON for ${operationName}:`, e);
    }
    if (!res.ok) {
        // 변경된 부분: 에러 메시지를 Error 객체의 message에 포함하여 던집니다.
        // 경고 메시지는 여기서 표현하지 않고, 호출하는 쪽에서 결정합니다.
        const errorMessage = `${operationName} 실패: ${errorText}`;
        const error = new Error(errorMessage);
        // 필요하다면 에러 객체에 추가 정보 (예: HTTP 상태 코드, 원본 에러 데이터)를 첨부할 수 있습니다.
        error.statusCode = res.status;
        error.errorData = errorJson;
        throw error;
    }
    // 성공적인 응답 처리
    let responseBody = {};
    try {
        const text = await res.text();
        if (text) {
            responseBody = JSON.parse(text);
        }
    }
    catch (e) {
        console.warn(`[handleApiResponse] Failed to parse success response body as JSON for ${operationName}:`, e);
        // 성공 응답이지만 JSON 파싱 실패 시, 빈 객체를 반환하거나 에러를 던질지 결정해야 함
        // 현재는 빈 객체 반환으로 가정
    }
    return {
        body: responseBody,
        status: res.status,
        message: `${operationName} 성공`,
    };
}

let initialized = false;
function setInitialized(enable) {
    initialized = enable;
}
function isInitialized() {
    return initialized;
}
const DEFAULT_INIT_AUTH_CONFIG = {
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
const endpointMeta = {
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
function clearConfigCache() {
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
function getConfig(forceRefresh = false) {
    if (_cachedConfig && !forceRefresh) {
        return _cachedConfig;
    }
    // 캐시가 없거나 강제 새로고침인 경우 내부 로딩 함수 호출
    _cachedConfig = _config();
    return _cachedConfig;
}
function getRefreshBeforeExpirySec() {
    return Number(getConfig().refreshBeforeExpirySec) || 1;
}
function getSessionExpiryPublishSec() {
    return Number(getConfig().sessionExpiryPublishSec) || 30;
}
function getSessionExpirypublishEnabled() {
    return !!getConfig().sessionExpirypublishEnabled;
}
function getJoinEndpoint() {
    return getConfig().joinEndpoint || DEFAULT_INIT_AUTH_CONFIG.joinEndpoint;
}
function hasJoinEndpoint() {
    return !!getJoinEndpoint();
}
function getPasswordChangeEndpoint() {
    return getConfig().passwordChangeEndpoint || DEFAULT_INIT_AUTH_CONFIG.passwordChangeEndpoint;
}
function hasPasswordChangeEndpoint() {
    return !!getPasswordChangeEndpoint();
}
function getPasswordFindEndpoint() {
    return getConfig().passwordFindEndpoint || DEFAULT_INIT_AUTH_CONFIG.passwordFindEndpoint;
}
function hasPasswordFindEndpoint() {
    return !!getPasswordFindEndpoint();
}
function getPasswordResetEndpoint() {
    return getConfig().passwordResetEndpoint || DEFAULT_INIT_AUTH_CONFIG.passwordResetEndpoint;
}
function hasPasswordResetEndpoint() {
    return !!getPasswordResetEndpoint();
}
function getSocialLoginEndpoint() {
    return getConfig().socialLoginEndpoint || DEFAULT_INIT_AUTH_CONFIG.socialLoginEndpoint;
}
function hasSocialLoginEndpoint() {
    return !!getSocialLoginEndpoint();
}
function getLoginByCodeEndpoint() {
    return getConfig().loginByCodeEndpoint || DEFAULT_INIT_AUTH_CONFIG.loginByCodeEndpoint;
}
function hasLoginByCodeEndpoint() {
    return !!getLoginByCodeEndpoint();
}
function getLogoutEndpoint() {
    return getConfig().logoutEndpoint || DEFAULT_INIT_AUTH_CONFIG.logoutEndpoint;
}
function getLoginEndpoint() {
    return getConfig().loginEndpoint || DEFAULT_INIT_AUTH_CONFIG.loginByCodeEndpoint;
}
function hasLogoutEndpoint() {
    return !!getLogoutEndpoint();
}
function hasLoginEndpoint() {
    return !!getLoginEndpoint();
}
function getRefreshEndpoint() {
    return getConfig().refreshEndpoint || DEFAULT_INIT_AUTH_CONFIG.refreshEndpoint;
}
function hasRefreshEndpoint() {
    return !!getRefreshEndpoint();
}
function getRedirectConfig() {
    return {
        redirectAfterLogin: !!getConfig().redirectAfterLogin,
        redirectPath: getConfig().redirectPath || DEFAULT_INIT_AUTH_CONFIG.onTokenExpiredRedirect,
    };
}
function getJoinUri() {
    return (getConfig().baseUrl || '') + getJoinEndpoint();
}
function getPasswordChangeUri() {
    return (getConfig().baseUrl || '') + getPasswordChangeEndpoint();
}
function getPasswordFindUri() {
    return (getConfig().baseUrl || '') + getPasswordFindEndpoint();
}
function getPasswordResetUri() {
    return (getConfig().baseUrl || '') + getPasswordResetEndpoint();
}
function getSocialLoginUri() {
    return (getConfig().baseUrl || '') + getSocialLoginEndpoint();
}
function getLoginByCodeUri() {
    return (getConfig().baseUrl || '') + getLoginByCodeEndpoint();
}
function getLogoutUri() {
    return (getConfig().baseUrl || '') + getLogoutEndpoint();
}
function getLoginUri() {
    return (getConfig().baseUrl || '') + getLoginEndpoint();
}
function getRefreshUri() {
    return (getConfig().baseUrl || '') + getRefreshEndpoint();
}

// fast-auth-with-keycloak 패키지 내부 유효성 검사 함수들
// FastAuthConfig 유효성 검사
const validateFastAuthConfig = (config) => {
    console.log("validateFastAuthConfig");
    if (!config) {
        return { isValid: false, error: 'FastAuthConfig가 제공되지 않았습니다.' };
    }
    const allEndpointTypes = Object.keys(endpointMeta);
    for (const endpoint of allEndpointTypes) {
        const validation = validateEndpoint(endpoint);
        if (!validation.isValid) {
            const friendlyName = endpointMeta[endpoint].name;
            throw new Error(`${friendlyName} 엔드포인트 유효성 검사 실패: ${validation.error}`);
        }
    }
    return { isValid: true };
};
// 엔드포인트 설정 유효성 검사
const validateEndpoint = (endpointType) => {
    const { name, isValid } = endpointMeta[endpointType];
    if (!isValid()) {
        return {
            isValid: false,
            error: `${name} 엔드포인트가 초기화 설정에 설정되지 않았습니다. 초기화면에서 설정해주세요.`,
        };
    }
    return { isValid: true };
};
// API 요청 옵션 유효성 검사
const validateApiRequestOptions = (options) => {
    if (options && typeof options !== 'object') {
        return { isValid: false, error: 'API 요청 옵션은 객체여야 합니다.' };
    }
    if ((options === null || options === void 0 ? void 0 : options.method) && !['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method.toUpperCase())) {
        return { isValid: false, error: '지원하지 않는 HTTP 메서드입니다.' };
    }
    if ((options === null || options === void 0 ? void 0 : options.headers) && typeof options.headers !== 'object') {
        return { isValid: false, error: '헤더는 객체여야 합니다.' };
    }
    return { isValid: true };
};
// 복합 유효성 검사 (여러 검증을 한번에 수행)
const validateMultiple = (validations) => {
    for (const validation of validations) {
        if (!validation.isValid) {
            return validation;
        }
    }
    return { isValid: true };
};
// 토큰 유효성 검사 (통합)
const validateToken = (userFriendly = true) => {
    if (!hasAccessToken()) {
        return {
            isValid: false,
            error: userFriendly ? '로그인 상태가 아닙니다. 다시 로그인 해주세요.' : '토큰이 없습니다.'
        };
    }
    if (isTokenExpired()) {
        return {
            isValid: false,
            error: userFriendly ? '토큰이 만료되었습니다. 다시 로그인 해주세요.' : '토큰이 만료되었습니다.'
        };
    }
    return { isValid: true };
};
// 인증 코드 유효성 검사
const validateAuthCode = (code) => {
    if (!code || !code.trim()) {
        return { isValid: false, error: '인증 코드를 찾을 수 없습니다.' };
    }
    return { isValid: true };
};

async function login({ username, password }) {
    const res = await fetch(endpointMeta.login.apiUri(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
    if (!res.ok)
        throw new Error(endpointMeta.login.name + ' 실패');
    const data = await res.json();
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return data;
}
async function loginByCode(code) {
    const res = await fetch(endpointMeta.loginByCode.apiUri(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || endpointMeta.loginByCode.name + '처리 중 오류가 발생했습니다.');
    }
    const data = await res.json();
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return data;
}
async function resetPassword(accessToken, newPassword) {
    const res = await fetch(endpointMeta.passwordReset.apiUri(), {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ newPassword }),
    });
    if (!res.ok) {
        const errorData = await res.json(); // 에러 발생 시에는 JSON 본문이 있을 가능성이 높으므로 유지
        throw new Error(errorData.message || endpointMeta.passwordReset.name + ' 처리 중 오류가 발생했습니다.');
    }
    if (res.status === 204) {
        return {}; // 또는 true, undefined 등. 호출하는 쪽에서 이 값을 어떻게 처리할지에 따라 결정.
    }
    try {
        return await res.json(); // 본문이 있다면 JSON 파싱
    }
    catch (e) {
        console.warn("API 응답에 JSON 본문이 없거나 파싱할 수 없습니다. 빈 객체를 반환합니다.", e);
        return {}; // 본문이 없거나 파싱 실패 시 빈 객체 반환
    }
}
async function refreshToken() {
    const config = getConfig();
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        console.log('[FastAuth] No refresh token available');
        return;
    }
    try {
        console.log('[FastAuth] Refreshing from:', config.refreshEndpoint);
        const res = await fetch(endpointMeta.refresh.apiUri(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) {
            const errorText = await res.text();
            console.error('[FastAuth] ' + endpointMeta.refresh.name + ' failed:', res.status, res.statusText, 'Response:', errorText);
            return;
        }
        const data = await res.json();
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);
        disablePublish();
        setupNextRefresh();
        console.log('[FastAuth] Token refreshed successfully');
    }
    catch (error) {
        console.error('[FastAuth] Token refresh error:', error);
    }
}
async function logout() {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
        console.log('[FastAuth] Refresh token is missing. Performing client-side logout only.');
        return;
    }
    try {
        const res = await fetch(`${endpointMeta.logout.apiUri()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) {
            const errorText = await res.text();
            console.error(endpointMeta.logout.name + ' 엔드포인트 호출 실패:', res.status, res.statusText, '응답 본문:', errorText);
            return;
        }
    }
    catch (error) {
        console.error(endpointMeta.logout.name + ' 엔드포인트 호출 중 오류 발생:', error);
    }
    removeAccessToken();
    removeRefreshToken();
}
async function changePassword(newPassword) {
    // 토큰 유효성 검사 및 헤더 설정 (fastAuthApiRequest에서 하던 로직을 직접 포함)
    const tokenValidation = validateToken(true);
    if (!tokenValidation.isValid) {
        if (tokenValidation.error === '토큰이 만료되었습니다.') {
            handleTokenExpired();
        }
        throw new Error(tokenValidation.error);
    }
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`, // 로그인 토큰 추가
    };
    const res = await fetch(endpointMeta.passwordChange.apiUri(), {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify({
            newPassword
        }),
    });
    // 응답 처리 (handleApiResponse 재사용)
    try {
        // '비밀번호 변경'과 관련된 메시지를 handleApiResponse에 전달
        return (await handleApiResponse(res, endpointMeta.passwordChange.name)).body;
    }
    catch (error) {
        console.warn(`[FastAuth] Failed to parse JSON for successful password change response (status: ${res.status}):`, error);
        return {}; // 이 경우에도 빈 객체를 반환하여 클라이언트에서 오류를 받지 않도록 함
    }
}
async function join(params) {
    const headers = {
        'Content-Type': 'application/json',
    };
    const res = await fetch(endpointMeta.join.apiUri(), {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(params), // 전달받은 모든 파라미터를 body에 포함
    });
    // 응답 처리 (handleApiResponse 재사용)
    try {
        return (await handleApiResponse(res, endpointMeta.join.name)).body;
    }
    catch (error) {
        console.warn(`[FastAuth] Failed to parse JSON for successful account join response (status: ${res.status}):`, error);
        return {};
    }
}
async function findPassword(params) {
    const headers = {
        'Content-Type': 'application/json',
    };
    const res = await fetch(endpointMeta.passwordFind.apiUri(), {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(params), // 전달받은 파라미터를 body에 포함
    });
    // 응답 처리 (handleApiResponse 재사용)
    try {
        return (await handleApiResponse(res, endpointMeta.passwordFind.name)).body;
    }
    catch (error) {
        // 에러를 외부로 throw하여 호출부가 catch하도록 함
        throw error; // 에러를 다시 던집니다.
    }
}

let refreshTimeout = null;
let publishTimeout = null;
let tokenWatchInterval = null;
let publishForThisSession = false;
function disablePublish() {
    publishForThisSession = false;
}
function enablePublish() {
    publishForThisSession = true;
}
function cleanTimers() {
    // 기존 타이머들 완전 정리
    if (refreshTimeout) {
        clearTimeout(refreshTimeout);
        refreshTimeout = null;
        console.log('[FastAuth] refreshTimeout 정리 완료');
    }
    if (publishTimeout) {
        clearTimeout(publishTimeout);
        publishTimeout = null;
        console.log('[FastAuth] publishTimeout 정리 완료');
    }
    if (tokenWatchInterval) {
        clearInterval(tokenWatchInterval);
        tokenWatchInterval = null;
        console.log('[FastAuth] tokenWatchInterval 정리 완료');
    }
}
async function checkAndRefreshToken() {
    if (isTokenExpiringSoon()) {
        await refreshToken();
    }
}
// setInterval 내부에 있던 로직을 분리한 도우미 함수
function handleTokenExpiryCheck(initialToken, isAutoRefresh) {
    const { isStaleOrInvalid, exp, remain } = getAccessTokenInfo(initialToken);
    if (isStaleOrInvalid) {
        clearInterval(tokenWatchInterval);
        tokenWatchInterval = null;
        startTokenExpiryWatcher(); // 새로운 토큰으로 타이머 재설정 시도
        return;
    }
    if (!exp) {
        clearInterval(tokenWatchInterval);
        tokenWatchInterval = null;
        return;
    }
    const publishBeforeSec = getSessionExpiryPublishSec();
    if (isAutoRefresh) ;
    else {
        if (!publishForThisSession && remain !== null && remain <= publishBeforeSec) {
            publishSessionExpiry(); // enablePublish 호출 제거
        }
    }
    if (remain !== null && remain <= 0) {
        clearInterval(tokenWatchInterval);
        tokenWatchInterval = null;
    }
}
function startTokenExpiryWatcher() {
    console.log("startTokenExpiryWatcher");
    if (tokenWatchInterval)
        clearInterval(tokenWatchInterval);
    if (!validateToken().isValid)
        return;
    const initialToken = getAccessToken(); // setInterval이 시작될 때의 토큰 스냅샷
    const config = getConfig(); // 항상 최신 설정을 가져오기 위해 getConfig() 직접 사용
    tokenWatchInterval = setInterval(() => handleTokenExpiryCheck(initialToken, config.autoRefresh), 2000);
}
function setupNextRefresh() {
    if (refreshTimeout)
        clearTimeout(refreshTimeout);
    if (publishTimeout)
        clearTimeout(publishTimeout);
    // 항상 최신 설정을 가져오기 위해 getConfig() 강제 새로고침 사용
    const config = getConfig(true); // 강제 새로고침으로 최신 설정 가져오기
    console.log('[FastAuth] setupNextRefresh - 현재 설정:', {
        autoRefresh: config.autoRefresh,
        sessionExpirypublishEnabled: config.sessionExpirypublishEnabled,
        sessionExpiryPublishSec: config.sessionExpiryPublishSec,
        refreshBeforeExpirySec: config.refreshBeforeExpirySec
    });
    if (!validateToken().isValid)
        return;
    const exp = getAccessTokenExpiration();
    if (!exp)
        return;
    const now = Date.now();
    if (exp - now <= 0) {
        // 이미 만료된 토큰이면 아무것도 하지 않음
        return;
    }
    startTokenExpiryWatcher();
    const refreshBeforeSec = getRefreshBeforeExpirySec();
    const publishBeforeSec = getSessionExpiryPublishSec();
    const publishEnabled = getSessionExpirypublishEnabled();
    if (config.autoRefresh) {
        const remainingTimeToRefresh = exp - now - refreshBeforeSec * 1000;
        if (remainingTimeToRefresh !== null && remainingTimeToRefresh > 0) {
            refreshTimeout = setTimeout(checkAndRefreshToken, remainingTimeToRefresh);
        }
        else if (remainingTimeToRefresh !== null) {
            checkAndRefreshToken();
        }
    }
    if ((!config.autoRefresh && publishEnabled)) {
        const msToAlert = exp - now - publishBeforeSec * 1000;
        if (msToAlert !== null) {
            if (msToAlert > 1000) {
                console.log('[fast-auth] 알림 타이머 설정:', msToAlert, 'ms 후 (설정값:', publishBeforeSec, '초)');
                publishTimeout = setTimeout(publishSessionExpiry, msToAlert);
            }
            else if (msToAlert <= 1000) {
                console.log('[fast-auth] 알림 즉시 실행 (설정값:', publishBeforeSec, '초)');
                publishSessionExpiry();
            }
        }
    }
}
function publishSessionExpiry() {
    console.log('[FastAuth] publishSessionExpiry 진입, publishForThisSession:', publishForThisSession);
    if (publishForThisSession) {
        console.log('[FastAuth] 이미 알림을 띄웠으므로 return');
        return;
    }
    enablePublish();
    console.log('[FastAuth] enablePublish 호출 완료');
    if (tokenWatchInterval) {
        clearInterval(tokenWatchInterval);
        tokenWatchInterval = null;
    }
    // 전역 상태로 다이얼로그 표시
    setSessionExpiryState(true, refreshToken, handleTokenExpired);
    console.log('[FastAuth] 다이얼로그 상태 설정 완료');
}
let sessionExpiryStateListeners = [];
let currentSessionExpiryState = {
    show: false,
    onExtend: null,
    onLogout: null
};
// 이벤트 리스너 등록/해제
function addSessionExpiryStateListener(listener) {
    sessionExpiryStateListeners.push(listener);
    // 등록 즉시 현재 상태 전달
    listener(currentSessionExpiryState);
}
function removeSessionExpiryStateListener(listener) {
    sessionExpiryStateListeners = sessionExpiryStateListeners.filter(l => l !== listener);
}
// 상태 변경 시 모든 리스너에게 알림
function notifySessionExpiryStateChange(state) {
    currentSessionExpiryState = state;
    sessionExpiryStateListeners.forEach(listener => listener(state));
}
// 전역 함수로 다이얼로그 상태 관리
function setSessionExpiryState(show, onExtend, onLogout) {
    const newState = {
        show,
        onExtend: onExtend || null,
        onLogout: onLogout || null
    };
    notifySessionExpiryStateChange(newState);
}
let _onTokenExpiredNavigate;
function setOnTokenExpiredNavigate(onTokenExpiredNavigate) {
    _onTokenExpiredNavigate = onTokenExpiredNavigate;
}
function handleTokenExpired() {
    const config = getConfig();
    removeAccessToken();
    removeRefreshToken();
    setInitialized(false);
    if (config.onTokenExpiredRedirect) {
        if (_onTokenExpiredNavigate) {
            _onTokenExpiredNavigate(config.onTokenExpiredRedirect);
        }
        else {
            window.location.href = config.onTokenExpiredRedirect;
        }
    }
}
// 앱이 시작될 때 accessToken이 있으면 만료 전까지 로그만 출력 (초기화 여부와 무관)
startTokenExpiryWatcher();

let fastAuthConfig = null;
setInitialized(false);
class FastAuthProvider {
    static init(config) {
        console.log('[FastAuth] FastAuthProvider 초기화 시작');
        // 설정 유효성 검사를 먼저 수행
        const configValidation = validateFastAuthConfig(config);
        if (!configValidation.isValid) {
            console.error('[FastAuth] 설정 유효성 검사 실패:', configValidation.error);
            throw new Error(configValidation.error);
        }
        fastAuthConfig = { ...config };
        console.log('[FastAuth] FastAuthProvider initialized with config:', fastAuthConfig);
        if (config.onTokenExpiredNavigate) {
            setOnTokenExpiredNavigate(config.onTokenExpiredNavigate);
            console.log('[FastAuth] onTokenExpiredNavigate 콜백 등록됨');
        }
        // 이미 초기화되어 있고 로그인 상태가 아닌 경우 중복 실행 방지
        if (isInitialized()) {
            if (validateToken().isValid) {
                console.log('[FastAuth] 로그인 상태에서 재초기화, 기존 타이머 정리');
                cleanTimers();
                // 설정 캐시 무효화 (새로운 설정이 즉시 적용되도록)
                clearConfigCache();
                setupNextRefresh();
            }
            else {
                console.log('[FastAuth] 이미 초기화되어 있음, 중복 실행 방지');
                return;
            }
        }
        setInitialized(true);
    }
    static async login({ username, password }) {
        const data = await login({ username, password });
        disablePublish();
        setupNextRefresh();
        return data;
    }
    static async loginByCode(code) {
        const data = loginByCode(code);
        disablePublish();
        setupNextRefresh();
        return data;
    }
    static socialLoginEndpoint() {
        return `${endpointMeta.socialLogin.apiUri()}`;
    }
    static async changePassword(newPassword) {
        return await changePassword(newPassword);
    }
    static async join(params) {
        return await join(params);
    }
    static async resetPassword(accessToken, newPassword) {
        return await resetPassword(accessToken, newPassword);
    }
    static async logout() {
        logout();
        disablePublish();
        // 초기화 플래그 리셋 (다음 로그인 시 정상 초기화를 위해)
        handleTokenExpired();
    }
    static async findPassword(params) {
        return await findPassword(params);
    }
}

exports.FastAuthProvider = FastAuthProvider;
exports.addSessionExpiryStateListener = addSessionExpiryStateListener;
exports.clearConfigCache = clearConfigCache;
exports.disablePublish = disablePublish;
exports.getConfig = getConfig;
exports.getEmail = getEmail;
exports.getRedirectConfig = getRedirectConfig;
exports.getUserName = getUserName;
exports.removeSessionExpiryStateListener = removeSessionExpiryStateListener;
exports.setSessionExpiryState = setSessionExpiryState;
exports.validateApiRequestOptions = validateApiRequestOptions;
exports.validateAuthCode = validateAuthCode;
exports.validateEndpoint = validateEndpoint;
exports.validateFastAuthConfig = validateFastAuthConfig;
exports.validateMultiple = validateMultiple;
exports.validateToken = validateToken;
//# sourceMappingURL=index.js.map
