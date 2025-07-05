// 요청 전에 수행되는 유효성 검사 함수들

import { hasAccessToken, isTokenExpired } from 'fast-auth-with-keycloak/token';
import { 
  hasPasswordChangeEndpoint, 
  hasPasswordResetEndpoint, 
  hasPasswordFindEndpoint,
  hasJoinEndpoint,
  getConfig
} from 'fast-auth-with-keycloak/config';

// 비밀번호 유효성 검사
export const validatePassword = (password: string, confirmPassword: string): { isValid: boolean; error?: string } => {
  if (password !== confirmPassword) {
    return { isValid: false, error: '비밀번호가 일치하지 않습니다.' };
  }
  
  if (password.length < 6) {
    return { isValid: false, error: '비밀번호는 최소 6자 이상이어야 합니다.' };
  }
  
  return { isValid: true };
};

// 토큰 유효성 검사
export const validateToken = (): { isValid: boolean; error?: string } => {
  if (!hasAccessToken()) {
    return { isValid: false, error: '로그인 상태가 아닙니다. 다시 로그인 해주세요.' };
  }
  
  if (isTokenExpired()) {
    return { isValid: false, error: '토큰이 만료되었습니다. 다시 로그인 해주세요.' };
  }
  
  return { isValid: true };
};

// URL 토큰 유효성 검사
export const validateUrlToken = (urlAccessToken: string | null): { isValid: boolean; error?: string } => {
  if (!urlAccessToken) {
    return { isValid: false, error: '유효한 접근 토큰이 없습니다.' };
  }
  
  return { isValid: true };
};

// 엔드포인트 설정 유효성 검사
export const validateEndpoint = (endpointType: 'passwordChange' | 'passwordReset' | 'passwordFind' | 'join'): { isValid: boolean; error?: string } => {
  const endpointValidators = {
    passwordChange: hasPasswordChangeEndpoint,
    passwordReset: hasPasswordResetEndpoint,
    passwordFind: hasPasswordFindEndpoint,
    join: hasJoinEndpoint
  };
  
  const validator = endpointValidators[endpointType];
  if (!validator()) {
    const endpointNames = {
      passwordChange: '비밀번호 변경',
      passwordReset: '비밀번호 초기화',
      passwordFind: '비밀번호 찾기',
      join: '계정 등록'
    };
    
    return { 
      isValid: false, 
      error: `${endpointNames[endpointType]} 엔드포인트가 초기화 설정에 설정되지 않았습니다. 초기화면에서 설정해주세요.` 
    };
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

// 이메일 형식 유효성 검사
export const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: '유효한 이메일 주소를 입력해주세요.' };
  }
  
  return { isValid: true };
};

// 사용자명 유효성 검사
export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  if (!username.trim()) {
    return { isValid: false, error: '사용자명을 입력해주세요.' };
  }
  
  if (username.length < 2) {
    return { isValid: false, error: '사용자명은 최소 2자 이상이어야 합니다.' };
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

// 인증 코드 유효성 검사
export const validateAuthCode = (code: string | null): { isValid: boolean; error?: string } => {
  if (!code || !code.trim()) {
    return { isValid: false, error: '인증 코드를 찾을 수 없습니다.' };
  }
  
  return { isValid: true };
}; 