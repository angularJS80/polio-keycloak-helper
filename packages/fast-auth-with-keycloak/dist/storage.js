const getStorage = (type) => {
    return type === 'local' ? localStorage : sessionStorage;
};
export const setItem = (type, key, value) => {
    getStorage(type).setItem(key, value);
};
export const getItem = (type, key) => {
    return getStorage(type).getItem(key);
};
export const removeItem = (type, key) => {
    getStorage(type).removeItem(key);
};
export const clearStorage = (type) => {
    getStorage(type).clear();
};
