
export const  handleApiResponse = async (res: Response, contextMessage = ''): Promise<{ body: any; error?: string }> => {
    if (!res.ok) {
        // API 요청 실패 시 응답 본문을 텍스트로 읽어 오류 메시지에 포함
        const errorText = await res.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(`API 요청 실패: ${errorJson.message || errorText}`);
        } catch {
          throw new Error(`API 요청 실패: ${errorText || res.statusText}`);
        }
        
    }

    // 응답 본문이 비어있을 수 있는 경우를 처리 (예: HTTP 204 No Content)
    const contentLength = res.headers.get('content-length');
    if (res.status === 204 || (contentLength === '0')) {
        return {body:{},error:''};
    }
    
    return {body:{},error:''};
};