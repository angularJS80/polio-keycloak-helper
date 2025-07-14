type StorageType = 'local' | 'session';
export declare const setItem: (type: StorageType, key: string, value: string) => void;
export declare const getItem: (type: StorageType, key: string) => string | null;
export declare const removeItem: (type: StorageType, key: string) => void;
export declare const clearStorage: (type: StorageType) => void;
export {};
