import {
    getAccessToken, getAccessTokenExpiration,
    getAccessTokenInfo, isTokenExpiringSoon,removeAccessToken, removeRefreshToken
} from './token';
import { refreshToken } from './api'
import { getConfig, getRefreshBeforeExpirySec, getSessionExpiryAlertSec, getSessionExpiryAlertEnabled,setInitialized} from './config';
import { validateToken } from './validator';
let refreshTimeout: ReturnType<typeof setTimeout> | null = null;
let alertTimeout: ReturnType<typeof setTimeout> | null = null;
let tokenWatchInterval: ReturnType<typeof setInterval> | null = null;
let alertShownForThisSession = false;

export function disableAlertShown() {
    alertShownForThisSession = false;
}

export function enableAlertShown() {
    alertShownForThisSession = true;
}


export function cleanTimers() {
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
export function handleTokenExpiryCheck(initialToken: string, isAutoRefresh: boolean) {
    const { isStaleOrInvalid, exp, remain } = getAccessTokenInfo(initialToken);

    if (isStaleOrInvalid) {
        clearInterval(tokenWatchInterval!);
        tokenWatchInterval = null;
        startTokenExpiryWatcher(); // 새로운 토큰으로 타이머 재설정 시도
        return;
    }

    if (!exp) {
        clearInterval(tokenWatchInterval!);
        tokenWatchInterval = null;
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
        clearInterval(tokenWatchInterval!);
        tokenWatchInterval = null;
    }
}

export function startTokenExpiryWatcher() {
    console.log("startTokenExpiryWatcher");
    if (tokenWatchInterval) clearInterval(tokenWatchInterval);
    if (!validateToken().isValid) return;

    const initialToken = getAccessToken() as string; // setInterval이 시작될 때의 토큰 스냅샷
    const config = getConfig(); // 항상 최신 설정을 가져오기 위해 getConfig() 직접 사용

    tokenWatchInterval = setInterval(() => handleTokenExpiryCheck(initialToken, config.autoRefresh), 2000);
}

export function setupNextRefresh() {
    if (refreshTimeout) clearTimeout(refreshTimeout);
    if (alertTimeout) clearTimeout(alertTimeout);

    // 항상 최신 설정을 가져오기 위해 getConfig() 강제 새로고침 사용
    const config = getConfig(true); // 강제 새로고침으로 최신 설정 가져오기
    console.log('[FastAuth] setupNextRefresh - 현재 설정:', {
        autoRefresh: config.autoRefresh,
        sessionExpiryAlertEnabled: config.sessionExpiryAlertEnabled,
        sessionExpiryAlertSec: config.sessionExpiryAlertSec,
        refreshBeforeExpirySec: config.refreshBeforeExpirySec
    });

    if (!validateToken().isValid) return;
    const exp = getAccessTokenExpiration();
    if (!exp) return;
    const now = Date.now();
    if (exp - now <= 0) {
        // 이미 만료된 토큰이면 아무것도 하지 않음
        return;
    }

    startTokenExpiryWatcher();
    const refreshBeforeSec = getRefreshBeforeExpirySec();
    const alertBeforeSec = getSessionExpiryAlertSec();
    const alertEnabled = getSessionExpiryAlertEnabled();

    if (config.autoRefresh) {
        const remainingTimeToRefresh = exp - now - refreshBeforeSec * 1000;

        if (remainingTimeToRefresh !== null && remainingTimeToRefresh > 0) {
            refreshTimeout = setTimeout(checkAndRefreshToken, remainingTimeToRefresh);
        } else if (remainingTimeToRefresh !== null) {
            checkAndRefreshToken();
        }
    }

    if ((!config.autoRefresh && alertEnabled)) {
        const msToAlert = exp - now - alertBeforeSec * 1000;

        if (msToAlert !== null) {
            if (msToAlert > 1000) {
                console.log('[fast-auth] 알림 타이머 설정:', msToAlert, 'ms 후 (설정값:', alertBeforeSec, '초)');
                alertTimeout = setTimeout(showSessionExpiryAlert, msToAlert);
            } else if (msToAlert <= 1000) {
                console.log('[fast-auth] 알림 즉시 실행 (설정값:', alertBeforeSec, '초)');
                showSessionExpiryAlert();
            }
        }
    }

}

export function showSessionExpiryAlert() {
    console.log('[FastAuth] showSessionExpiryAlert 진입, alertShownForThisSession:', alertShownForThisSession);

    if (alertShownForThisSession) {
        console.log('[FastAuth] 이미 알림을 띄웠으므로 return');
        return;
    }

    enableAlertShown();
    console.log('[FastAuth] enableAlertShown 호출 완료');

    if (tokenWatchInterval) {
        clearInterval(tokenWatchInterval);
        tokenWatchInterval = null;
    }

    // 전역 상태로 다이얼로그 표시
    setSessionExpiryDialogState(true, refreshToken, handleTokenExpired);
    console.log('[FastAuth] 다이얼로그 상태 설정 완료');
}


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
export function notifyDialogStateChange(state: DialogState) {
    currentDialogState = state;
    dialogStateListeners.forEach(listener => listener(state));
}


export function checkSessionExpiryDialogState() {
    return currentDialogState;
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

let _onTokenExpiredNavigate: ((path: string) => void) | undefined;

export function setOnTokenExpiredNavigate(onTokenExpiredNavigate: (path: string) => void) {
    _onTokenExpiredNavigate = onTokenExpiredNavigate;
  }
  
  export function getOnTokenExpiredNavigate() {
    return _onTokenExpiredNavigate;
  }

export function handleTokenExpired() {
    const config = getConfig();
    removeAccessToken();
    removeRefreshToken();
    setInitialized(false) ;
    
    if (config.onTokenExpiredRedirect) {
      if (_onTokenExpiredNavigate) {
        _onTokenExpiredNavigate(config.onTokenExpiredRedirect);
      } else {
        window.location.href = config.onTokenExpiredRedirect;
      }
    }
  }

// 앱이 시작될 때 accessToken이 있으면 만료 전까지 로그만 출력 (초기화 여부와 무관)
startTokenExpiryWatcher();