import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './movies.entity';
import { MovieGenre } from './MovieGenre.entity';
import { MovieRating } from './MovieRating.entity';
import { WatchList } from './WatchList.entity';

@Module({
  controllers: [MoviesController],
  providers: [MoviesService],
  imports: [TypeOrmModule.forFeature([Movie, MovieGenre, MovieRating, WatchList])],
})
export class MoviesModule {}
