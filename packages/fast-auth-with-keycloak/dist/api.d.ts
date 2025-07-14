export declare function login({ username, password }: {
    username: string;
    password: string;
}): Promise<any>;
export declare function loginByCode(code: string): Promise<any>;
export declare function resetPassword(accessToken: string, newPassword: string): Promise<any>;
export declare function refreshToken(): Promise<void>;
export declare function logout(): Promise<void>;
export declare function changePassword(newPassword: string): Promise<any>;
export declare function join(params: {
    username: string;
    email: string;
    password: string;
    [key: string]: any;
}): Promise<any>;
export declare function findPassword(params: {
    email?: string;
    username?: string;
}): Promise<any>;
