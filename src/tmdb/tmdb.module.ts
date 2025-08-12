import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TmdbConfig } from './tmdb.config';
import { TmdbClient } from './tmdb.client';
import { TmdbGenresApi } from './resources/genres.api';

@Module({
  imports: [
    ConfigModule,
  ],
  exports: [TmdbGenresApi],
  providers: [TmdbConfig, TmdbClient, TmdbGenresApi],
})
export class TmdbModule {}
