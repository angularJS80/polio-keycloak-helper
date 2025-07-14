/**
 * API 응답을 처리하고 성공 또는 실패에 따라 적절한 데이터를 반환하거나 에러를 던집니다.
 * @param res fetch API 응답 객체
 * @param operationName 수행된 작업명 (예: '로그인', '비밀번호 변경' 등)
 * @returns Promise<{ body: any; status: number; message: string; }>
 * @throws Error API 응답이 실패 상태일 경우 에러 객체를 던집니다.
 */
export async function handleApiResponse(res, operationName) {
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
