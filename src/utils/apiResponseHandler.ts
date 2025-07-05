// API 호출 이후 처리 함수들

import { FastAuthProvider, fastAuthApiRequest } from 'fast-auth-with-keycloak';
import { setItem } from 'fast-auth-with-keycloak/storage';
import { getProfileConfig, getRedirectConfig } from 'fast-auth-with-keycloak/config';
import { DEFAULT_REDIRECT_PATH } from './constants';

// API 응답 처리 타입 정의
export interface ApiResponseHandler {
  showSuccess?: (msg: string) => void;
  showError?: (msg: string) => void;
  navigate?: (path: string, options?: { replace?: boolean }) => void;
  setLoading?: (loading: boolean) => void;
  resetForm?: () => void;
}

// 로그인 성공 후 처리
export const handleLoginSuccess = async (
  response: any, 
  handler: ApiResponseHandler
): Promise<void> => {
  try {
    // FastAuthProvider.login에서 이미 토큰이 설정되었으므로 세션만 재개
    FastAuthProvider.resumeSession();
    
    // 프로필 조회 (설정된 경우)
    const { profileAfterLogin, profileEndpoint } = getProfileConfig();
    if (profileAfterLogin && profileEndpoint) {
      try {
        const user = await fastAuthApiRequest(profileEndpoint);
        setItem('session', 'fast-auth-username', user.username);
      } catch (profileErr) {
        // 프로필 조회 실패는 치명적이지 않으므로 무시
        console.warn('프로필 조회 실패:', profileErr);
      }
    }
    
    // 리다이렉트 처리
    const { redirectAfterLogin, redirectPath } = getRedirectConfig();
    if (redirectAfterLogin && redirectPath && handler.navigate) {
      handler.navigate(redirectPath, { replace: true });
    } else if (handler.navigate) {
      handler.navigate(DEFAULT_REDIRECT_PATH, { replace: true });
    }
    
    if (handler.showSuccess) {
      handler.showSuccess('로그인 성공!');
    }
  } catch (error) {
   
    if (handler.showError) {
      handler.showError('로그인 처리 중 오류가 발생했습니다.');
    }
  }
};

// 비밀번호 변경 성공 후 처리
export const handlePasswordChangeSuccess = (
  handler: ApiResponseHandler
): void => {
  if (handler.showSuccess) {
    handler.showSuccess('비밀번호가 성공적으로 변경되었습니다!');
  }
  
  if (handler.resetForm) {
    handler.resetForm();
  }
};

// 비밀번호 초기화 성공 후 처리
export const handlePasswordResetSuccess = (
  handler: ApiResponseHandler
): void => {
  if (handler.showSuccess) {
    handler.showSuccess('비밀번호가 성공적으로 변경되었습니다!');
  }
  
  if (handler.resetForm) {
    handler.resetForm();
  }
};

// 비밀번호 찾기 성공 후 처리
export const handlePasswordFindSuccess = (
  handler: ApiResponseHandler
): void => {
  if (handler.showSuccess) {
    handler.showSuccess('비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해주세요.');
  }
  
  if (handler.resetForm) {
    handler.resetForm();
  }
};

// 계정 등록 성공 후 처리
export const handleJoinSuccess = (
  handler: ApiResponseHandler
): void => {
  if (handler.showSuccess) {
    handler.showSuccess('계정 등록이 성공적으로 완료되었습니다!');
  }
  
  if (handler.resetForm) {
    handler.resetForm();
  }
};

// API 오류 처리
export const handleApiError = (
  error: any, 
  handler: ApiResponseHandler,
  defaultMessage: string = '요청 처리 중 오류가 발생했습니다.'
): void => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  
  if (handler.showError) {
    handler.showError(`${defaultMessage}: ${errorMessage}`);
  }
  
  if (handler.setLoading) {
    handler.setLoading(false);
  }
};

// 네트워크 오류 처리
export const handleNetworkError = (
  handler: ApiResponseHandler
): void => {
  if (handler.showError) {
    handler.showError('네트워크 오류 또는 서버 응답 없음.');
  }
  
  if (handler.setLoading) {
    handler.setLoading(false);
  }
};

// HTTP 응답 오류 처리
export const handleHttpError = async (
  response: Response,
  handler: ApiResponseHandler,
  defaultMessage: string = '요청 처리 중 오류가 발생했습니다.'
): Promise<void> => {
  try {
    const errorData = await response.json();
    const errorMessage = errorData.message || response.statusText || defaultMessage;
    
    if (handler.showError) {
      handler.showError(errorMessage);
    }
  } catch {
    // JSON 파싱 실패 시 기본 오류 메시지 사용
    if (handler.showError) {
      handler.showError(`${defaultMessage}: ${response.status} ${response.statusText}`);
    }
  }
  
  if (handler.setLoading) {
    handler.setLoading(false);
  }
};

// 로딩 상태 초기화
export const resetLoadingState = (handler: ApiResponseHandler): void => {
  if (handler.setLoading) {
    handler.setLoading(false);
  }
};

// 폼 초기화
export const resetFormState = (
  setterFunctions: Array<(value: string) => void>,
  handler?: ApiResponseHandler
): void => {
  setterFunctions.forEach(setter => setter(''));
  
  if (handler?.resetForm) {
    handler.resetForm();
  }
}; 