declare function disablePublish(): void;
type sessionExpiryState = {
    show: boolean;
    onExtend: (() => void) | null;
    onLogout: (() => void) | null;
};
type sessionExpiryStateStateListener = (state: sessionExpiryState) => void;
declare function addSessionExpiryStateListener(listener: sessionExpiryStateStateListener): void;
declare function removeSessionExpiryStateListener(listener: sessionExpiryStateStateListener): void;
declare function setSessionExpiryState(show: boolean, onExtend?: () => void, onLogout?: () => void): void;

type FastAuthConfig = {
    baseUrl: string;
    loginEndpoint: string;
    loginByCodeEndpoint: string;
    refreshEndpoint: string;
    logoutEndpoint: string;
    joinEndpoint: string;
    passwordChangeEndpoint: string;
    passwordFindEndpoint: string;
    passwordResetEndpoint: string;
    socialLoginEndpoint: string;
    autoRefresh: boolean;
    onTokenExpiredRedirect: string;
    onTokenExpiredNavigate?: (path: string) => void;
};
declare class FastAuthProvider {
    static init(config: FastAuthConfig): void;
    static login({ username, password }: {
        username: string;
        password: string;
    }): Promise<any>;
    static loginByCode(code: string): Promise<any>;
    static socialLoginEndpoint(): string;
    static changePassword(newPassword: string): Promise<any>;
    static join(params: {
        username: string;
        email: string;
        password: string;
        [key: string]: any;
    }): Promise<any>;
    static resetPassword(accessToken: string, newPassword: string): Promise<any>;
    static logout(): Promise<void>;
    static findPassword(params: {
        email?: string;
        username?: string;
    }): Promise<any>;
}

interface Config {
    baseUrl: string;
    loginEndpoint: string;
    refreshEndpoint: string;
    logoutEndpoint: string;
    autoRefresh: boolean;
    onTokenExpiredRedirect: string;
    joinEndpoint: string;
    passwordChangeEndpoint: string;
    passwordFindEndpoint: string;
    passwordResetEndpoint: string;
    socialLoginEndpoint: string;
    loginByCodeEndpoint: string;
    refreshBeforeExpirySec?: number;
    sessionExpiryPublishSec?: number;
    sessionExpirypublishEnabled: boolean;
    redirectAfterLogin?: boolean;
    redirectPath?: string;
    onSessionExpiryAlert?: (onExtend: () => void, onLogout: () => void) => void;
}
type EndpointType = 'login' | 'passwordChange' | 'passwordReset' | 'passwordFind' | 'join' | 'logout' | 'refresh' | 'socialLogin' | 'loginByCode';
declare function clearConfigCache(): void;
declare function getConfig(forceRefresh?: boolean): Config;
declare function getRedirectConfig(): {
    redirectAfterLogin: boolean;
    redirectPath: string;
};

declare function getUserName(): string | null;
declare function getEmail(): string | null;

declare const validateFastAuthConfig: (config: any) => {
    isValid: boolean;
    error?: string;
};
declare const validateEndpoint: (endpointType: EndpointType) => {
    isValid: boolean;
    error?: string | undefined;
};
declare const validateApiRequestOptions: (options: any) => {
    isValid: boolean;
    error?: string;
};
declare const validateMultiple: (validations: Array<{
    isValid: boolean;
    error?: string;
}>) => {
    isValid: boolean;
    error?: string;
};
declare const validateToken: (userFriendly?: boolean) => {
    isValid: boolean;
    error?: string;
};
declare const validateAuthCode: (code: string | null) => {
    isValid: boolean;
    error?: string;
};

export { FastAuthProvider, addSessionExpiryStateListener, clearConfigCache, disablePublish, getConfig, getEmail, getRedirectConfig, getUserName, removeSessionExpiryStateListener, setSessionExpiryState, validateApiRequestOptions, validateAuthCode, validateEndpoint, validateFastAuthConfig, validateMultiple, validateToken };
