// sdk/apiClient.ts
import { getConfig } from './Config';

let accessToken = '';

export const setAccessToken = (token: string) => {
  accessToken = token;
};

export const apiGet = async (path: string) => {
  const res = await fetch(`${getConfig().apiBaseUrl}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
  });

  if (!res.ok) {
    throw new Error(`API 호출 실패: ${res.status}`);
  }

  return res.json();
};

export const apiPost = async (path: string, body: any) => {
  const res = await fetch(`${getConfig().apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    },
    body: JSON.stringify(body),
    credentials: 'include', 
  });

  if (!res.ok) {
    throw new Error(`API 호출 실패: ${res.status}`);
  }

  return res.json();
};
