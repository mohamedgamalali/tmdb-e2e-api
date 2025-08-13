import { Injectable } from '@nestjs/common';
import { TmdbClient } from '../tmdb.client';
import { TmdbMovieList } from '../tmdb.types';

@Injectable()
export class TmdbMoviesApi {
  constructor(private client: TmdbClient) {}

  listPopularMovies(page: number, genres?: string[]) {
    return this.client.request<TmdbMovieList>({
      url: '/movie/popular',
      method: 'GET',
      params: {
        page,
        language: 'en-US',
        ...(genres?.length ? { with_genres: genres.join(',') } : {}),
      },
    });
  }
}