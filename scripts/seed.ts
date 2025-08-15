import { NestFactory } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import dataSource from '../db/db-source';
import { ConfigValidationSchema } from '../src/config/validation';
import { DataSeedService } from '../db/seeds/data-seed';
import { TmdbModule } from '../src/tmdb/tmdb.module';
import { SyncMoviesService } from 'src/sync/sync.movies.service';
import { SyncModule } from 'src/sync/sync.module';
import { CacheService } from 'src/common/cache/cache.service';
import { AppCacheModule } from 'src/common/cache/cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: ConfigValidationSchema,
    }),
    TypeOrmModule.forRoot(dataSource.options),
    TmdbModule,
    SyncModule,
    AppCacheModule
  ],
  providers: [DataSeedService],
})
class SeedModule {}

async function bootstrap() {
  try {
    console.log('Starting database seeding...');
    
    if (!dataSource.isInitialized) {
      await dataSource.initialize();
      console.log('Database connection initialized');
    }
    
    const app = await NestFactory.createApplicationContext(SeedModule);
    const seedService = app.get(DataSeedService);
    
    await seedService.seedDatabase();
    
    await app.close();
    
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    
    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    
    process.exit(1);
  }
}

bootstrap(); 