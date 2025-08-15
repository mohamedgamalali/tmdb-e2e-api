import { Test, TestingModule } from "@nestjs/testing";
import { CacheService } from "./cache.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { CacheKeysMap, getCacheKey } from "./keys";
import { makeRedisClient } from "test/utils/redis-mock";

const MOCK_CACHE_MAP = new Map<string, any>();

const mockCacheManager = {
  get: jest.fn().mockImplementation((key: string) => {
    return MOCK_CACHE_MAP.get(key);
  }),
  set: jest.fn().mockImplementation((key: string, value: any, ttl: number) => {
    MOCK_CACHE_MAP.set(key, value);
  }),
}

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheService, {
        provide: CACHE_MANAGER,
        useValue: mockCacheManager,
      },
      {
        provide: 'REDIS_CLIENT',
        useValue: makeRedisClient(),
      }],
    }).compile();
    service = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be able to set cache value', async () => {
    const key = CacheKeysMap.GET_GENRES;
    const query = { page: 1, limit: 10 };
    const value = { id: 1, name: 'test' };
    const ttl = 60 * 5;
    await service.set(key, query, value, ttl);
    const cacheKey = getCacheKey(key, query);
    expect(service['redisClient'].set).toHaveBeenCalledWith(cacheKey, JSON.stringify(value), 'EX', ttl * 1000);
  });

  it('should be able to get cache value', async () => {
    const key = CacheKeysMap.GET_GENRES;
    const query = { page: 1, limit: 10 };
    const value = { id: 1, name: 'test' };
    const ttl = 60 * 5;
    await service.set(key, query, value, ttl);
    const result = await service.get(key, query);
    expect(result).toEqual(JSON.stringify(value));
  });

  it('should return undefined if cache value is not found', async () => {
    const key = CacheKeysMap.GET_GENRES;
    const query = { page: 2, limit: 10 };
    const result = await service.get(key, query);
    expect(result).toBeNull();
  });

  it('dynamic cache keys should not care about the order of the query', async () => {
    const key = CacheKeysMap.GET_GENRES;
    const query1 = { search: 'test', limit: 10 };
    const query2 = { limit: 10, search: 'test' };
    const value = { id: 1, name: 'test' };
    const ttl = 60 * 5;
    await service.set(key, query1, value, ttl);
    const result = await service.get(key, query2);
    expect(result).toEqual(JSON.stringify(value));
  });

});