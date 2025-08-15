import {
    Inject,
    Injectable,
    Logger,
    OnApplicationShutdown,
  } from '@nestjs/common';
  import { CACHE_MANAGER } from '@nestjs/cache-manager';
  import type { Cache } from 'cache-manager';
  
  @Injectable()
  export class RedisLifecycleService implements OnApplicationShutdown {
    private readonly log = new Logger(RedisLifecycleService.name);
  
    constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  
    async onApplicationShutdown() {
        await this.cache.disconnect()
      }
  } 