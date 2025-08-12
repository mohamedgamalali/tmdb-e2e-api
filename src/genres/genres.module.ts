import { Module } from '@nestjs/common';
import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';
import { Genre } from './genre.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TmdbModule } from 'src/tmdb/tmdb.module';

@Module({
  controllers: [GenresController],
  imports: [TypeOrmModule.forFeature([Genre]), TmdbModule],
  providers: [GenresService],
})
export class GenresModule {}
