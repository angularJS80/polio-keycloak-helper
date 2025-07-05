// fast-auth-with-keycloak 패키지 내부 유효성 검사 함수들

import { hasAccessToken, isTokenExpired } from './token';
import { 
  getConfig, 
  hasPasswordChangeEndpoint, 
  hasPasswordResetEndpoint, 
  hasPasswordFindEndpoint,
  hasJoinEndpoint,
  EndpointType
} from './config';

// FastAuthConfig 유효성 검사
export const validateFastAuthConfig = (config: any): { isValid: boolean; error?: string } => {
  if (!config) {
    return { isValid: false, error: 'FastAuthConfig가 제공되지 않았습니다.' };
  }

  if (!config.baseUrl) {
    return { isValid: false, error: 'baseUrl이 설정되지 않았습니다.' };
  }

  if (!config.loginEndpoint) {
    return { isValid: false, error: 'loginEndpoint가 설정되지 않았습니다.' };
  }

  // refreshEndpoint 검증을 ENDPOINT_CONFIG를 사용하도록 수정
  const refreshValidation = validateEndpoint('refresh');
  if (!refreshValidation.isValid) {
    return { isValid: false, error: refreshValidation.error };
  }

  return { isValid: true };
};

// 필수 설정 유효성 검사
export const validateRequiredConfig = (requiredFields: string[]): { isValid: boolean; error?: string } => {
  const config = getConfig();
  
  for (const field of requiredFields) {
    if (!config[field as keyof typeof config]) {
      return { 
        isValid: false, 
        error: `초기화 설정에 ${field}이(가) 설정되지 않았습니다. 관리자에게 문의하세요.` 
      };
    }
  }
  
  return { isValid: true };
};

// 엔드포인트 설정 유효성 검사
export const validateEndpoint = (endpointType: EndpointType): { isValid: boolean; error?: string } => {
  const endpointChecks: Record<EndpointType, () => boolean> = {
    passwordChange: hasPasswordChangeEndpoint,
    passwordReset: hasPasswordResetEndpoint,
    passwordFind: hasPasswordFindEndpoint,
    join: hasJoinEndpoint,
    logout: () => !!getConfig().logoutEndpoint,
    refresh: () => !!getConfig().refreshEndpoint
  };
  
  const endpointNames: Record<EndpointType, string> = {
    passwordChange: '비밀번호 변경',
    passwordReset: '비밀번호 초기화',
    passwordFind: '비밀번호 찾기',
    join: '계정 등록',
    logout: '로그아웃',
    refresh: '토큰 갱신'
  };
  
  const check = endpointChecks[endpointType];
  if (!check()) {
    return { 
      isValid: false, 
      error: `${endpointNames[endpointType]} 엔드포인트가 초기화 설정에 설정되지 않았습니다. 초기화면에서 설정해주세요.` 
    };
  }
  
  return { isValid: true };
};

// API 요청 옵션 유효성 검사
export const validateApiRequestOptions = (options: any): { isValid: boolean; error?: string } => {
  if (options && typeof options !== 'object') {
    return { isValid: false, error: 'API 요청 옵션은 객체여야 합니다.' };
  }

  if (options?.method && !['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method.toUpperCase())) {
    return { isValid: false, error: '지원하지 않는 HTTP 메서드입니다.' };
  }

  if (options?.headers && typeof options.headers !== 'object') {
    return { isValid: false, error: '헤더는 객체여야 합니다.' };
  }

  return { isValid: true };
};

// 복합 유효성 검사 (여러 검증을 한번에 수행)
export const validateMultiple = (validations: Array<{ isValid: boolean; error?: string }>): { isValid: boolean; error?: string } => {
  for (const validation of validations) {
    if (!validation.isValid) {
      return validation;
    }
  }
  return { isValid: true };
};

// 토큰 유효성 검사 (통합)
export const validateToken = (userFriendly: boolean = true): { isValid: boolean; error?: string } => {
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
export const validateAuthCode = (code: string | null): { isValid: boolean; error?: string } => {
  if (!code || !code.trim()) {
    return { isValid: false, error: '인증 코드를 찾을 수 없습니다.' };
  }
  
  return { isValid: true };
}; 