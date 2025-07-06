// API 호출 이후 처리 함수들

// API 응답 처리 타입 정의
export interface ApiResponseHandler {
  showSuccess?: (msg: string) => void;
  showError?: (msg: string) => void;
  navigate?: (path: string, options?: { replace?: boolean }) => void;
  setLoading?: (loading: boolean) => void;
  resetForm?: () => void;
}

// 공통 성공 후 처리 (비밀번호 찾기, 계정 등록 등)
export const handleApiSuccess = (
  handler: ApiResponseHandler,
  message: string
): void => {
  if (handler.setLoading) {
    handler.setLoading(false);
  }
  
  if (handler.showSuccess) {
    handler.showSuccess(message);
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

