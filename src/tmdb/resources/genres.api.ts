import { Injectable } from '@nestjs/common';
import { TmdbClient } from '../tmdb.client';
import { TmdbGenreList } from '../tmdb.types';

@Injectable()
export class TmdbGenresApi {
  constructor(private client: TmdbClient) {}

  listGenres() {
    return this.client.request<TmdbGenreList>({
      url: '/genre/movie/list',
      method: 'GET',
    });
  }
}