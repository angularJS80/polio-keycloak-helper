// fast-auth-with-keycloak 패키지 진입점

import { getConfig, clearConfigCache,  endpointMeta, isInitialized, setInitialized} from './config';
import { 
  validateFastAuthConfig, 
  validateToken,
  validateAuthCode
} from './validator';
import {login, loginByCode, refreshToken , resetPassword, logout, changePassword, join, findPassword} from './api'
import {cleanTimers, checkAndRefreshToken, setupNextRefresh, addDialogStateListener, setSessionExpiryDialogState,removeDialogStateListener, disableAlertShown, setOnTokenExpiredNavigate, getOnTokenExpiredNavigate} from './sessionManager'
export type FastAuthConfig = {
  baseUrl: string;
  loginEndpoint: string;
  loginByCodeEndpoint: string;
  refreshEndpoint: string;
  logoutEndpoint: string;
  joinEndpoint: string;
  passwordChangeEndpoint: string;
  passwordFindEndpoint: string;
  passwordResetEndpoint: string;
  socialLoginEndpoint: string;
  autoRefresh: boolean;
  onTokenExpiredRedirect: string;
  onTokenExpiredNavigate?: (path: string) => void;
};

let fastAuthConfig: FastAuthConfig | null = null;
let refreshTimeout: ReturnType<typeof setTimeout> | null = null;

setInitialized(false);

export class FastAuthProvider {
  static init(config: FastAuthConfig) {
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
      if(validateToken().isValid){
        console.log('[FastAuth] 로그인 상태에서 재초기화, 기존 타이머 정리');
        cleanTimers();  
        // 설정 캐시 무효화 (새로운 설정이 즉시 적용되도록)
        clearConfigCache();
        setupNextRefresh();      
      } else {
        console.log('[FastAuth] 이미 초기화되어 있음, 중복 실행 방지');
        return;
      }
    }
    
    setInitialized(true);
    
  }

  static async login({ username, password }: { username: string; password: string }) {
    const data = await login({username, password});
    disableAlertShown();
    setupNextRefresh();
    return data;
  }

  static async loginByCode(code: string) {
    const data = loginByCode(code)
    disableAlertShown();
    setupNextRefresh();
    return data;
  }

  static socialLoginEndpoint(){
    return `${endpointMeta.socialLogin.apiUri()}`;
  }


  static async changePassword(newPassword: string): Promise<any> {
    return await changePassword(newPassword);
  }

  static async join(params: {
    username: string;
    email: string;
    password: string;
    [key: string]: any
  }): Promise<any> {
    return await join(params);
  }
  
  static async resetPassword(accessToken: string, newPassword: string) {
    return await resetPassword(accessToken, newPassword);
  }

  static async logout() {
    logout();
    disableAlertShown();
    if (refreshTimeout) clearTimeout(refreshTimeout);

    // 초기화 플래그 리셋 (다음 로그인 시 정상 초기화를 위해)
    setInitialized(false);

    const config = getConfig();
    if (config.onTokenExpiredRedirect) {
      if (getOnTokenExpiredNavigate()) {
        setOnTokenExpiredNavigate(()=>config.onTokenExpiredRedirect);
      } else {
        window.location.href = config.onTokenExpiredRedirect;
      }
    }
    
  }

  

  static async findPassword(params: { email?: string; username?: string }): Promise<any> {
    return await findPassword(params);
  }
}

// validator 함수들 export
export * from './validator';
export { 
  setupNextRefresh,
  checkAndRefreshToken, 
  refreshToken,
  validateToken,
  validateAuthCode,
  addDialogStateListener,
  setSessionExpiryDialogState,
  removeDialogStateListener,
  disableAlertShown
}; 