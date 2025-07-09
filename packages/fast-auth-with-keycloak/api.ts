import { endpointMeta } from './config';
import { setAccessToken, setRefreshToken, getAccessToken,removeAccessToken,  removeRefreshToken, getRefreshToken } from './token';
import { handleApiResponse } from './apiResultHandler';
import { getConfig } from './config';
import { validateToken } from './validator';
import { FastAuthProvider, setupNextRefresh } from 'fast-auth-with-keycloak'
import { disableAlertShown} from './sessionManager'

export async function login({ username, password }: { username: string; password: string }) {
    const res = await fetch( endpointMeta.login.apiUri(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error(endpointMeta.login.name+' 실패');
    const data = await res.json();
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    return data;
  }

  export async function loginByCode(code: string) {
    const res = await fetch( endpointMeta.loginByCode.apiUri(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || endpointMeta.loginByCode.name+'처리 중 오류가 발생했습니다.');
    }
    
    const data = await res.json();
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
   
    return data;
  }

  export async function resetPassword(accessToken: string, newPassword: string) {
    const res = await fetch(endpointMeta.passwordReset.apiUri(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ newPassword }),
    });
    
    if (!res.ok) {
      const errorData = await res.json(); // 에러 발생 시에는 JSON 본문이 있을 가능성이 높으므로 유지
      throw new Error(errorData.message || endpointMeta.passwordReset.name+' 처리 중 오류가 발생했습니다.');
    }
    
    if (res.status === 204) {
      return {}; // 또는 true, undefined 등. 호출하는 쪽에서 이 값을 어떻게 처리할지에 따라 결정.
    }

    try {
      return await res.json(); // 본문이 있다면 JSON 파싱
    } catch (e) {
      console.warn("API 응답에 JSON 본문이 없거나 파싱할 수 없습니다. 빈 객체를 반환합니다.", e);
      return {}; // 본문이 없거나 파싱 실패 시 빈 객체 반환
    }
  }

  export async function refreshToken(): Promise<void> {
    const config = getConfig();
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      console.log('[FastAuth] No refresh token available');
      return;
    }
  
    try {
      console.log('[FastAuth] Refreshing from:', config.refreshEndpoint);
      const res = await fetch( endpointMeta.refresh.apiUri(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
  
      if (!res.ok) {
        const errorText = await res.text();
        console.error('[FastAuth] '+endpointMeta.refresh.name+' failed:', res.status, res.statusText, 'Response:', errorText);
        return;
      }
  
      const data = await res.json();
      setAccessToken(data.accessToken);
      setRefreshToken(data.refreshToken);
      disableAlertShown();
      setupNextRefresh();
      console.log('[FastAuth] Token refreshed successfully');
    } catch (error) {
      console.error('[FastAuth] Token refresh error:', error);
    }
  }


  export async function logout() {
   
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      console.log('[FastAuth] Refresh token is missing. Performing client-side logout only.');
      return;
    }
    
    
    try {
      const res = await fetch(`${endpointMeta.logout.apiUri()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });
    
      if (!res.ok) {
        const errorText = await res.text();
        console.error(endpointMeta.logout.name+' 엔드포인트 호출 실패:', res.status, res.statusText, '응답 본문:', errorText);
        return;
      }
    } catch (error) {
      console.error(endpointMeta.logout.name+' 엔드포인트 호출 중 오류 발생:', error);
    }


    removeAccessToken();
    removeRefreshToken();
    
  }

  export async function changePassword(newPassword: string): Promise<any> {

    // 토큰 유효성 검사 및 헤더 설정 (fastAuthApiRequest에서 하던 로직을 직접 포함)
    const tokenValidation = validateToken(true);
    if (!tokenValidation.isValid) {
      if (tokenValidation.error === '토큰이 만료되었습니다.') {
        FastAuthProvider.handleTokenExpired();
      }
      throw new Error(tokenValidation.error);
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getAccessToken()}`, // 로그인 토큰 추가
    };

    const res = await fetch(endpointMeta.passwordChange.apiUri(), {
      method: 'PUT',
      headers: headers,
      body: JSON.stringify({
        newPassword
      }),
    });

    // 응답 처리 (handleApiResponse 재사용)
    try {
      // '비밀번호 변경'과 관련된 메시지를 handleApiResponse에 전달
      return (await handleApiResponse(res, endpointMeta.passwordChange.name)).body;
    } catch (error) {
      console.warn(`[FastAuth] Failed to parse JSON for successful password change response (status: ${res.status}):`, error);
      return {}; // 이 경우에도 빈 객체를 반환하여 클라이언트에서 오류를 받지 않도록 함
    }
  }

  export async function join(params: {
    username: string;
    email: string;
    password: string;
    [key: string]: any
  }): Promise<any> {

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const res = await fetch( endpointMeta.join.apiUri(), {
      method: 'POST', // 사용자 등록은 일반적으로 POST 메소드 사용
      headers: headers,
      body: JSON.stringify(params), // 전달받은 모든 파라미터를 body에 포함
    });

    // 응답 처리 (handleApiResponse 재사용)
    try {
      return (await handleApiResponse(res, endpointMeta.join.name)).body;
    } catch (error) {
      console.warn(`[FastAuth] Failed to parse JSON for successful account join response (status: ${res.status}):`, error);
      return {};
    }
  }

  export async function findPassword(params: { email?: string; username?: string }): Promise<any> {

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const res = await fetch( endpointMeta.passwordFind.apiUri(), {
      method: 'POST', // 비밀번호 찾기는 일반적으로 POST 메소드 사용
      headers: headers,
      body: JSON.stringify(params), // 전달받은 파라미터를 body에 포함
    });

    // 응답 처리 (handleApiResponse 재사용)
    try {
      return (await handleApiResponse(res, endpointMeta.passwordFind.name)).body;
    } catch (error) {
      // 에러를 외부로 throw하여 호출부가 catch하도록 함
      throw error; // 에러를 다시 던집니다.
    }
  }

