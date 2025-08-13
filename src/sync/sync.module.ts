import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TmdbModule } from '../tmdb/tmdb.module';
import { Genre } from '../genres/genre.entity';
import { Movie } from '../movies/movies.entity';
import { MovieGenre } from '../movies/MovieGenre.entity';
import { SyncGenresService } from './sync.genres.service';
import { SyncMoviesService } from './sync.movies.service';

@Module({
  imports: [TmdbModule, TypeOrmModule.forFeature([Genre, Movie, MovieGenre])],
  providers: [SyncGenresService, SyncMoviesService],
  exports: [SyncGenresService, SyncMoviesService],
})
export class SyncModule {}