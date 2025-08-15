import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Genre } from '../genres/genre.entity';
import { TmdbGenresApi } from '../tmdb/resources/genres.api';
import { toGenreEntity } from '../tmdb';
import { CacheService } from 'src/common/cache/cache.service';
import { CacheKeysMap } from 'src/common/cache/keys';

@Injectable()
export class SyncGenresService {
  constructor(
    @Inject(TmdbGenresApi) private readonly tmdbGenresApi: TmdbGenresApi,
    @Inject(CacheService) private readonly cacheService: CacheService,
    @InjectRepository(Genre) private readonly genresRepo: Repository<Genre>,
  ) {}

  async run(): Promise<Genre[]> {
    const tmdbGeneres = await this.tmdbGenresApi.listGenres();
      const genres = await this.genresRepo.upsert(
           tmdbGeneres.genres.map(genre => toGenreEntity(genre)),
          {conflictPaths: ['tmdb_id']}
      );
      await this.cacheService.delByPrefix(CacheKeysMap.GET_GENRES);
      return genres.raw || [];
  }
}