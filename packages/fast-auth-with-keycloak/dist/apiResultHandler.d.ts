/**
 * API 응답을 처리하고 성공 또는 실패에 따라 적절한 데이터를 반환하거나 에러를 던집니다.
 * @param res fetch API 응답 객체
 * @param operationName 수행된 작업명 (예: '로그인', '비밀번호 변경' 등)
 * @returns Promise<{ body: any; status: number; message: string; }>
 * @throws Error API 응답이 실패 상태일 경우 에러 객체를 던집니다.
 */
export declare function handleApiResponse(res: Response, operationName: string): Promise<any>;
