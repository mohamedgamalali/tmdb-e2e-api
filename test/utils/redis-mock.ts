const mem = new Map<string, any>();

export const makeRedisClient = () => {
  const client: any = {
    set: jest.fn(async (key: string, value: any, _ex?: string, _ttl?: number) => {
      mem.set(key, value);
      return 'OK';
    }),
    get: jest.fn(async (key: string) => mem.get(key) ?? null),
    del: jest.fn(async (...keys: string[]) => {
      let n = 0;
      for (const k of keys) {
        if (mem.delete(k)) n++;
      }
      return n;
    }),
    scan: jest.fn(async (_cursor: string, _match: string, pattern: string, _count: string, _n: number) => {
      const keys = Array.from(mem.keys()).filter(k => k.startsWith(pattern.replace('*', '')));
      return { cursor: '0', keys };
    }),
    quit: jest.fn(async () => {
      client.status = 'end';
    }),
    on: jest.fn(),
    removeAllListeners: jest.fn(),
    status: 'ready',
  };

  return client;
};

export const cacheMock = {
    get: jest.fn().mockResolvedValue(undefined),
    set: jest.fn().mockResolvedValue(undefined),
    del: jest.fn().mockResolvedValue(undefined),
  };

export const mockedCacheService = {
    get: jest.fn(),
    set: jest.fn(),
    delByPrefix: jest.fn(),
  };