type StorageType = 'local' | 'session';

const isBrowser = typeof window !== 'undefined';

const getStorage = (type: StorageType): Storage | null => {
  if (!isBrowser) return null;

  try {
    return type === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
};

export const webStorage = {
  getItem(key: string, type: StorageType = 'session'): string | null {
    const storage = getStorage(type);
    if (!storage) return null;

    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  },

  setItem(key: string, value: string, type: StorageType = 'session'): void {
    const storage = getStorage(type);
    if (!storage) return;

    try {
      storage.setItem(key, value);
    } catch {
      // Ignore quota or access errors
    }
  },

  removeItem(key: string, type: StorageType = 'session'): void {
    const storage = getStorage(type);
    if (!storage) return;

    try {
      storage.removeItem(key);
    } catch {
      // Ignore errors
    }
  }
};
