import { TmdbGenre } from './tmdb.types';
import { Genre } from '../genres/genre.entity';

export const toGenreEntity = (g: TmdbGenre): Partial<Genre> => ({
  tmdbId: g.id,
  name: g.name,
});