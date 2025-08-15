import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoviesModule } from './movies/movies.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import dataSource from 'db/db-source';
import { ConfigValidationSchema } from 'src/config/validation';
import { DataSource } from 'typeorm';
import { LoggerMiddleware } from 'src/common/logger.middleware';
import { GenresModule } from './genres/genres.module';
import { TmdbModule } from './tmdb/tmdb.module';
import { CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { RedisLifecycleService } from 'src/common/cache/redis-lifecycle.service';
import Redis from 'ioredis';
import { redisStore } from 'cache-manager-redis-store';
import { AppCacheModule } from './common/cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: ConfigValidationSchema,
    }),
    AppCacheModule,
    TypeOrmModule.forRoot(dataSource.options),
    MoviesModule,
    GenresModule,
    TmdbModule,
  ],
  controllers: [AppController],
  providers: [AppService, RedisLifecycleService],
})
export class AppModule implements NestModule {
  constructor(private dataSource: DataSource) {
    console.log('Connected to database: ', dataSource.driver.database);
  }
  configure(consumer: MiddlewareConsumer) {
    if (process.env.NODE_ENV === 'development') {
      consumer.apply(LoggerMiddleware).forRoutes('*');
    }
  }
}
