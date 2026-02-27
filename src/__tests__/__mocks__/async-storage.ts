const storage: Record<string, string> = {};

export default {
  setItem: jest.fn(async (key: string, value: string) => {
    storage[key] = value;
    return Promise.resolve();
  }),
  getItem: jest.fn(async (key: string) => {
    return Promise.resolve(storage[key] || null);
  }),
  removeItem: jest.fn(async (key: string) => {
    delete storage[key];
    return Promise.resolve();
  }),
  clear: jest.fn(async () => {
    Object.keys(storage).forEach((key) => delete storage[key]);
    return Promise.resolve();
  }),
  getAllKeys: jest.fn(async () => {
    return Promise.resolve(Object.keys(storage));
  }),
  multiGet: jest.fn(async (keys: string[]) => {
    return keys.map((key) => [key, storage[key] || null]);
  }),
  multiSet: jest.fn(async (keyValuePairs: string[][]) => {
    keyValuePairs.forEach(([key, value]) => {
      storage[key] = value;
    });
    return Promise.resolve();
  }),
};
