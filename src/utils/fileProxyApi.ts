import { FastAuthProvider, validateToken } from 'fast-auth-with-keycloak';
import { getConfig } from 'fast-auth-with-keycloak/config';
import { getAccessToken } from 'fast-auth-with-keycloak/token';

export interface UploadPresignedUrlResponse {
  presignedUrl: string;
  key: string;
}

interface MyFilesResponse {
  files: FileMeta[];
}

// DTO에 맞춘 인터페이스
export interface FileMeta {
  id: number;
  key: string;
  fileName: string;
  contentType: string;
  fileSize: number;
  status: 'PENDING' | 'COMPLETED';
  uploadBy: string;
  visibility: string;
  presignedUrl: string | null;
}

export interface UploadFileListResponse {
  files: FileMeta[];
}


const FILE_API_PREFIX = '/api/v1/files';

async function authorizedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const tokenValidation = validateToken(true);
  if (!tokenValidation.isValid) {
    if (tokenValidation.error === '토큰이 만료되었습니다.') {
      FastAuthProvider.handleTokenExpired();
    }
    throw new Error(tokenValidation.error);
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${getAccessToken()}`);

  return fetch(url, { ...options, headers });
}

export async function getUploadPresignedUrl(fileName: string, contentType: string,  visibility: string): Promise<UploadPresignedUrlResponse> {
  const { baseUrl } = getConfig();
  const params = new URLSearchParams({ fileName, contentType, visibility });

  const res = await authorizedFetch(`${baseUrl}${FILE_API_PREFIX}/upload-presigned-url?${params}`, {
    method: 'GET',
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || res.statusText);
  }

  return res.json();
}

export async function uploadToS3(presignedUrl: string, file: File): Promise<void> {
  const res = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || res.statusText);
  }
}

export async function completeUpload(key: string): Promise<void> {
  const { baseUrl } = getConfig();
  const params = new URLSearchParams({ key });

  const res = await authorizedFetch(`${baseUrl}${FILE_API_PREFIX}/complete-upload?${params}`, {
    method: 'POST',
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || res.statusText);
  }
}

export async function getMyFiles(): Promise<FileMeta[]> {
  const { baseUrl } = getConfig();

  const res = await authorizedFetch(`${baseUrl}${FILE_API_PREFIX}/my-uploads`, {
    method: 'GET',
  });

  if (!res.ok) {
    throw new Error('파일 목록 조회 실패');
  }

  // 여기서 명시적으로 MyFilesResponse 타입을 사용하여 구조를 강제합니다.
  const data: MyFilesResponse = await res.json();

  // 이제 타입스크립트가 data.files가 존재함을 확실히 알게 됩니다.
  return data.files || [];
}

/**
 * 파일의 공개 여부를 변경합니다.
 * @param fileId 파일 ID
 * @param visibility 'PUBLIC' 또는 'PRIVATE'
 */
export async function updateFileVisibility(fileId: number, visibility: 'PUBLIC' | 'PRIVATE'): Promise<void> {
  const { baseUrl } = getConfig();
  
  // PATCH 요청을 통해 visibility 업데이트
  const res = await authorizedFetch(`${baseUrl}${FILE_API_PREFIX}/${fileId}/visibility?visibility=${visibility}`, {
    method: 'PUT',
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || res.statusText);
  }
}