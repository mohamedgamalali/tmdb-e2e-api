import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Movie } from '../movies/movies.entity';
import { Genre } from '../genres/genre.entity';
import { MovieGenre } from '../movies/MovieGenre.entity';
import { TmdbMoviesApi } from '../tmdb/resources/movies.api';
import { toMovieEntity } from '../tmdb/tmdb.mapper';
import { CacheService } from 'src/common/cache/cache.service';
import { CacheKeysMap } from 'src/common/cache/keys';

@Injectable()
export class SyncMoviesService {
  constructor(
    @Inject(TmdbMoviesApi) private readonly tmdbMovies: TmdbMoviesApi,
    @Inject(CacheService) private readonly cacheService: CacheService,
    @InjectRepository(Movie) private readonly movieRepo: Repository<Movie>,
    @InjectRepository(Genre) private readonly genreRepo: Repository<Genre>,
    @InjectRepository(MovieGenre) private readonly movieGenreRepo: Repository<MovieGenre>,
  ) {}

  async run({ pages = 10, TmdbGenresIds, startPage = 1 }: { pages?: number; TmdbGenresIds?: string[]; startPage?: number }): Promise<number> {
    // get all generes map once for performace
    const allGenres = await this.genreRepo.find({ select: { id: true, tmdb_id: true } });
    const gMap = new Map<string, string>();
    allGenres.forEach(g => gMap.set(String(g.tmdb_id), g.id));

    let total = 0;
    let currentPage = startPage;
    while (currentPage <= pages) {
      console.log(`Syncing movies from page ${currentPage}, Max pages: ${pages}`);
      const { results } = await this.tmdbMovies.listPopularMovies(currentPage, TmdbGenresIds);
      if (!results?.length) break;

      await this.movieRepo
        .upsert(results.map(m => toMovieEntity(m)), ['tmdb_id']);

      const tmdbIds = results.map(m => String(m.id));
      const batchMovies = await this.movieRepo.find({
        where: { tmdb_id: In(tmdbIds) },
        select: { id: true, tmdb_id: true },
      });
      const mMap = new Map<string, string>();
      batchMovies.forEach(m => mMap.set(String(m.tmdb_id), m.id));

      const movieGenreRelations: Array<Pick<MovieGenre, 'movie_id' | 'genre_id'>> = [];
      const movieIds: string[] = [];
      for (const m of results) {
        const mid = mMap.get(String(m.id));
        if (!mid) continue;
        movieIds.push(mid);
        for (const gid of m.genre_ids ?? []) {
          const gidInternal = gMap.get(String(gid));
          if (gidInternal) movieGenreRelations.push({ movie_id: mid, genre_id: gidInternal });
        }
      }

      // this operation has to be atomic 
      await this.movieGenreRepo.manager.transaction(async trx => {
        try {
            const tx = trx.getRepository(MovieGenre);
            if (movieIds.length) {
              await tx.createQueryBuilder().delete().from(MovieGenre)
                .where('movie_id IN (:...ids)', { ids: movieIds })
                .execute();
            }
            if (movieGenreRelations.length) {
              await tx.createQueryBuilder().insert().into(MovieGenre)
                .values(movieGenreRelations)
                .orIgnore()
                .execute();
            }
        } catch (err) {
          if (err?.code === '23503') {
            console.warn('Some genre/movie IDs not found, skipping invalid relations', err);
          } else {
            throw err;
          }
        }
      });
      total += results.length;
      currentPage++;
    }
    await this.cacheService.delByPrefix(CacheKeysMap.GET_MOVIES);
    await this.cacheService.delByPrefix(CacheKeysMap.GET_WATCH_LIST);
    return total;
  }
}
