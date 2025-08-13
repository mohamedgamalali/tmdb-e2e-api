import { TmdbGenre, TmdbMovie } from './tmdb.types';
import { Genre } from '../genres/genre.entity';
import { Movie } from 'src/movies/movies.entity';

export const toGenreEntity = (g: TmdbGenre): Partial<Genre> => ({
  tmdb_id: g.id.toString(),
  name: g.name,
});

export const toMovieEntity = (m: TmdbMovie): Partial<Movie> => ({
  tmdb_id: m.id.toString(),
  title: m.title,
  overview: m.overview ?? '',
  release_date: m.release_date ? new Date(m.release_date) : undefined,
  poster_path: m.poster_path,
  backdrop_path: m.backdrop_path,
  popularity: m.popularity ?? 0,
  vote_average: m.vote_average ?? 0,
  vote_count: m.vote_count ?? 0,
});
