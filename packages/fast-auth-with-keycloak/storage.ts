type StorageType = 'local' | 'session';

const getStorage = (type: StorageType) => {
  return type === 'local' ? localStorage : sessionStorage;
};

export const setItem = (type: StorageType, key: string, value: string) => {
  getStorage(type).setItem(key, value);
};

export const getItem = (type: StorageType, key: string) => {
  return getStorage(type).getItem(key);
};

export const removeItem = (type: StorageType, key: string) => {
  getStorage(type).removeItem(key);
};

export const clearStorage = (type: StorageType) => {
  getStorage(type).clear();
}; 