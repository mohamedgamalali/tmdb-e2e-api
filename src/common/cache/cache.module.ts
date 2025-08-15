import { Module } from '@nestjs/common';
import { CacheModule, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { CacheService } from './cache.service';
let redisClient: any;
export const setRedisClient = (c: any) => { redisClient = c; };
export const getRedisClient = () => redisClient;
@Module({
  imports: [
    ConfigModule,
    CacheModule.registerAsync({
        isGlobal: true,
        imports: [ConfigModule],
        useFactory: async (config: ConfigService) => {
          const url = config.get<string>('REDIS_URL');
          const store = await redisStore({ url, database: 0 });
          const client = store.getClient?.() || (store as any).redis || (store as any).client;
          setRedisClient(client);
          return {
            store: () => store,
            ttl: 60 * 5 * 1000,
          };
        },
        inject: [ConfigService],
      }),
  ],
  providers: [
    {
        provide: 'REDIS_CLIENT',
        inject: [CACHE_MANAGER],
        useFactory: () => getRedisClient(),
    },
    CacheService,
  ],
  exports: [
    'REDIS_CLIENT',
    CacheModule,
    CacheService,
  ],
})
export class AppCacheModule {}
