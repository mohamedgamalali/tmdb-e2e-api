import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TmdbModule } from '../tmdb/tmdb.module';
import { Genre } from '../genres/genre.entity';
import { Movie } from '../movies/movies.entity';
import { MovieGenre } from '../movies/MovieGenre.entity';
import { SyncGenresService } from './sync.genres.service';
import { SyncMoviesService } from './sync.movies.service';
import { CacheService } from 'src/common/cache/cache.service';
import { AppCacheModule } from 'src/common/cache/cache.module';

@Module({
  imports: [TmdbModule, TypeOrmModule.forFeature([Genre, Movie, MovieGenre]), AppCacheModule],
  providers: [SyncGenresService, SyncMoviesService],
  exports: [SyncGenresService, SyncMoviesService],
})
export class SyncModule {}