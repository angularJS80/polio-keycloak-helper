import { FastAuthProvider } from 'fast-auth-with-keycloak';
import { getInitConfig, getProfileConfig as getProfileConfigFromInit, getRedirectConfig as getRedirectConfigFromInit, getJoinEndpoint as getJoinEndpointFromInit, getPasswordResetEndpoint as getPasswordResetEndpointFromInit } from 'fast-auth-with-keycloak/initConfig';

export const getProfileConfig = getProfileConfigFromInit;
export const getRedirectConfig = getRedirectConfigFromInit;
export const getJoinEndpoint = getJoinEndpointFromInit;
export const getPasswordResetEndpoint = getPasswordResetEndpointFromInit;

export function ensureInit() {
  const config = getInitConfig();
  FastAuthProvider.init(config);
} 