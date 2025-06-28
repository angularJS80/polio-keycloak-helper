import { FastAuthProvider, fastAuthApiRequest } from 'fast-auth-with-keycloak';
import { getAccessToken } from 'fast-auth-with-keycloak/token';
import { DEFAULT_AUTH_CONFIG } from '../config';

export const LOCAL_STORAGE_KEY = 'fast-auth-init-config';

export function ensureInit() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      FastAuthProvider.init(JSON.parse(saved));
    } catch {}
  }
}

export function getProfileConfig() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      const config = JSON.parse(saved);
      return {
        profileAfterLogin: !!config.profileAfterLogin,
        profileEndpoint: config.profileEndpoint || '/me',
      };
    } catch {}
  }
  return { profileAfterLogin: false, profileEndpoint: '/me' };
}

export function getRedirectConfig() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      const config = JSON.parse(saved);
      return {
        redirectAfterLogin: !!config.redirectAfterLogin,
        redirectPath: config.redirectPath || '/welcome',
      };
    } catch {}
  }
  return { redirectAfterLogin: false, redirectPath: '/welcome' };
}

export function getJoinEndpoint() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      const config = JSON.parse(saved);
      return config.joinEndpoint || '';
    } catch {
      return '';
    }
  }
  return '';
}

export function loadInitConfig() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return {
        ...DEFAULT_AUTH_CONFIG,
        profileAfterLogin: false,
        profileEndpoint: '/me',
        joinEndpoint: '/join',
        passwordChangeEndpoint: '/password-change',
      };
    }
  }
  return {
    ...DEFAULT_AUTH_CONFIG,
    profileAfterLogin: false,
    profileEndpoint: '/me',
    joinEndpoint: '/join',
    passwordChangeEndpoint: '/password-change',
  };
} 