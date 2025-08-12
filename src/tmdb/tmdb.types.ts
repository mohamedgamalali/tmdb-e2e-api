export interface TmdbGenre { id: number; name: string; }
export interface TmdbGenreList { genres: TmdbGenre[]; }

export interface TmdbMovie {
  id: number;
  title: string;
  overview?: string;
  release_date?: string;
  poster_path?: string;
  backdrop_path?: string;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
}

export interface TmdbPaged<T> {
  page: number;
  total_pages: number;
  total_results: number;
  results: T[];
}