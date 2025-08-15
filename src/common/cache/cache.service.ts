import { Inject, Injectable } from "@nestjs/common";
import { CacheKeysMap, getCacheKey, getPrefix } from "./keys";
import Redis from "ioredis";

@Injectable()
export class CacheService {
  constructor(
    @Inject('REDIS_CLIENT') private redisClient: Redis
  ) {}

  async set(key: CacheKeysMap, query: object, value: object, ttl: number) {
    const cacheKey = getCacheKey(key, query);
    await this.redisClient.set(cacheKey, JSON.stringify(value), 'EX', ttl * 1000);
  }

  async get(key: CacheKeysMap, query: object) {
    const cacheKey = getCacheKey(key, query);
    return await this.redisClient.get(cacheKey);
  }

  async delByPrefix(key: CacheKeysMap) {
    const client = this.redisClient;
    if (!client) {
        console.warn('no client available, cannot delete by prefix');
        return;
    }

    const pattern = getPrefix(key);
    let cursor = '0';
    do {
      let res: any;
      res = await client.scan(cursor, 'MATCH', pattern, 'COUNT', 200);
      cursor = res.cursor;
      const keys = res.keys || [];
      if (keys.length) await Promise.all(keys.map(key => client.del(key)));
    } while (Number(cursor) !== 0);
  }
}