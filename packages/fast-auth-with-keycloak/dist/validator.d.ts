import { EndpointType } from './config';
export declare const validateFastAuthConfig: (config: any) => {
    isValid: boolean;
    error?: string;
};
export declare const validateEndpoint: (endpointType: EndpointType) => {
    isValid: boolean;
    error?: string | undefined;
};
export declare const validateApiRequestOptions: (options: any) => {
    isValid: boolean;
    error?: string;
};
export declare const validateMultiple: (validations: Array<{
    isValid: boolean;
    error?: string;
}>) => {
    isValid: boolean;
    error?: string;
};
export declare const validateToken: (userFriendly?: boolean) => {
    isValid: boolean;
    error?: string;
};
export declare const validateAuthCode: (code: string | null) => {
    isValid: boolean;
    error?: string;
};
