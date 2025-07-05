// UI 관련 유틸리티 함수들

// 공통 상수들

// 초기화 설정 없이 접근 가능한 경로 목록
export const PUBLIC_PATHS = [
  '/config',
  '/login',
  '/join',
  '/find-password',
  '/reset-password',
  '/auth/callback',
];

// 기본 리다이렉트 경로
export const DEFAULT_REDIRECT_PATH = '/welcome';

// 로그인 페이지 경로
export const LOGIN_PATH = '/login';

// 설정 페이지 경로
export const CONFIG_PATH = '/config';

// 폼 초기화
export const resetFormState = (
  setterFunctions: Array<(value: string) => void>,
  handler?: { resetForm?: () => void }
): void => {
  setterFunctions.forEach(setter => setter(''));
  
  if (handler?.resetForm) {
    handler.resetForm();
  }
};

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

// 로그인 요청 유효성 검사
export const validateLoginRequest = (username: string, password: string): { isValid: boolean; error?: string } => {
  if (!username || !username.trim()) {
    return { isValid: false, error: '사용자명을 입력해주세요.' };
  }

  if (!password || !password.trim()) {
    return { isValid: false, error: '비밀번호를 입력해주세요.' };
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