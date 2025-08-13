import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TmdbConfig } from './tmdb.config';
import { TmdbClient } from './tmdb.client';
import { TmdbGenresApi } from './resources/genres.api';
import { TmdbMoviesApi } from './resources/movies.api';

@Module({
  imports: [
    ConfigModule,
  ],
  exports: [TmdbGenresApi, TmdbMoviesApi],
  providers: [TmdbConfig, TmdbClient, TmdbGenresApi, TmdbMoviesApi],
})
export class TmdbModule {}
