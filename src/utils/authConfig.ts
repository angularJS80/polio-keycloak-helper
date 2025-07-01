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
  const config = loadInitConfig();
  return {
    profileAfterLogin: !!config.profileAfterLogin,
    profileEndpoint: config.profileEndpoint || DEFAULT_AUTH_CONFIG.profileEndpoint || '/me',
  };
}

export function getRedirectConfig() {
  const config = loadInitConfig();
  return {
    redirectAfterLogin: !!config.redirectAfterLogin,
    redirectPath: config.redirectPath || DEFAULT_AUTH_CONFIG.onTokenExpiredRedirect || '/welcome',
  };
}

export function getJoinEndpoint() {
  const config = loadInitConfig();
  return config.joinEndpoint || DEFAULT_AUTH_CONFIG.joinEndpoint || '';
}

export function getPasswordResetEndpoint() {
  const config = loadInitConfig();
  return config.passwordResetEndpoint || DEFAULT_AUTH_CONFIG.passwordResetEndpoint || '';
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
        joinEndpoint: '/auth/join',
        passwordChangeEndpoint: '/auth/password-change',
        passwordResetEndpoint: '/auth/reset-password',
        passwordFindEndpoint: '/auth/password-find',
        socialLoginEndpoint: '/auth/social-login',
        codeLoginEndpoint: '/auth/login-by-code',
      };
    }
  }
  return {
    ...DEFAULT_AUTH_CONFIG,
    profileAfterLogin: false,
    profileEndpoint: '/me',
    joinEndpoint: '/auth/join',
    passwordChangeEndpoint: '/auth/password-change',
    passwordResetEndpoint: '/auth/reset-password',
    passwordFindEndpoint: '/auth/password-find',
    socialLoginEndpoint: '/auth/social-login',
    codeLoginEndpoint: '/auth/login-by-code',
  };
} 