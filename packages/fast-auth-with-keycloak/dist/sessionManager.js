import { getAccessToken, getAccessTokenExpiration, getAccessTokenInfo, isTokenExpiringSoon, removeAccessToken, removeRefreshToken } from './token';
import { refreshToken } from './api';
import { getConfig, getRefreshBeforeExpirySec, getSessionExpiryPublishSec, getSessionExpirypublishEnabled, setInitialized } from './config';
import { validateToken } from './validator';
let refreshTimeout = null;
let publishTimeout = null;
let tokenWatchInterval = null;
let publishForThisSession = false;
export function disablePublish() {
    publishForThisSession = false;
}
export function enablePublish() {
    publishForThisSession = true;
}
export function cleanTimers() {
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
export async function checkAndRefreshToken() {
    if (isTokenExpiringSoon()) {
        await refreshToken();
    }
}
// setInterval 내부에 있던 로직을 분리한 도우미 함수
export function handleTokenExpiryCheck(initialToken, isAutoRefresh) {
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
    if (isAutoRefresh) {
    }
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
export function startTokenExpiryWatcher() {
    console.log("startTokenExpiryWatcher");
    if (tokenWatchInterval)
        clearInterval(tokenWatchInterval);
    if (!validateToken().isValid)
        return;
    const initialToken = getAccessToken(); // setInterval이 시작될 때의 토큰 스냅샷
    const config = getConfig(); // 항상 최신 설정을 가져오기 위해 getConfig() 직접 사용
    tokenWatchInterval = setInterval(() => handleTokenExpiryCheck(initialToken, config.autoRefresh), 2000);
}
export function setupNextRefresh() {
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
export function publishSessionExpiry() {
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
export function addSessionExpiryStateListener(listener) {
    sessionExpiryStateListeners.push(listener);
    // 등록 즉시 현재 상태 전달
    listener(currentSessionExpiryState);
}
export function removeSessionExpiryStateListener(listener) {
    sessionExpiryStateListeners = sessionExpiryStateListeners.filter(l => l !== listener);
}
// 상태 변경 시 모든 리스너에게 알림
export function notifySessionExpiryStateChange(state) {
    currentSessionExpiryState = state;
    sessionExpiryStateListeners.forEach(listener => listener(state));
}
export function checkSessionExpirysessionExpiryState() {
    return currentSessionExpiryState;
}
// 전역 함수로 다이얼로그 상태 관리
export function setSessionExpiryState(show, onExtend, onLogout) {
    const newState = {
        show,
        onExtend: onExtend || null,
        onLogout: onLogout || null
    };
    notifySessionExpiryStateChange(newState);
}
let _onTokenExpiredNavigate;
export function setOnTokenExpiredNavigate(onTokenExpiredNavigate) {
    _onTokenExpiredNavigate = onTokenExpiredNavigate;
}
export function getOnTokenExpiredNavigate() {
    return _onTokenExpiredNavigate;
}
export function handleTokenExpired() {
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
