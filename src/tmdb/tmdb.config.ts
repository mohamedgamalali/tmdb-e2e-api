import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TmdbConfig {
  constructor(private cfg: ConfigService) {}

  get apiKey() {
    const k = this.cfg.get<string>('TMDB_API_KEY');
    if (!k) throw new Error('TMDB_API_KEY missing');
    return k;
  }
  readonly baseUrl = 'https://api.themoviedb.org/3';
  readonly timeoutMs = 8000;
}