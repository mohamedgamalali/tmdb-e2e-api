import { Module } from '@nestjs/common';
import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';
import { Genre } from './genre.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TmdbModule } from 'src/tmdb/tmdb.module';
import { CacheService } from 'src/common/cache/cache.service';
import { AppCacheModule } from 'src/common/cache/cache.module';

@Module({
  controllers: [GenresController],
  imports: [TypeOrmModule.forFeature([Genre]), TmdbModule, AppCacheModule],
  providers: [GenresService, CacheService],
})
export class GenresModule {}
