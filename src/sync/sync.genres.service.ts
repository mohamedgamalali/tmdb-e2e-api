import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Genre } from '../genres/genre.entity';
import { TmdbGenresApi } from '../tmdb/resources/genres.api';
import { toGenreEntity } from '../tmdb';

@Injectable()
export class SyncGenresService {
  constructor(
    @Inject(TmdbGenresApi) private readonly tmdbGenresApi: TmdbGenresApi,
    @InjectRepository(Genre) private readonly genresRepo: Repository<Genre>,
  ) {}

  async run(): Promise<Genre[]> {
    const tmdbGeneres = await this.tmdbGenresApi.listGenres();
      const genres = await this.genresRepo.upsert(
           tmdbGeneres.genres.map(genre => toGenreEntity(genre)),
          {conflictPaths: ['tmdb_id']}
      );
      return genres.raw || [];
  }
}