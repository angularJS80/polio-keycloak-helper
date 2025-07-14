export type FastAuthConfig = {
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
export declare class FastAuthProvider {
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
