import { DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { Genre } from '../../src/genres/genre.entity';
import { Movie } from '../../src/movies/movies.entity';
import { MovieGenre } from '../../src/movies/MovieGenre.entity';
import { chunk } from 'lodash';
//mocks
const genresData = require('../../test/__mocks__/genres.json');
const moviesData = require('../../test/__mocks__/movies.json');
const movieGenresData = require('../../test/__mocks__/movie_genres.json');

@Injectable()
export class TestDataSeedService {
  constructor(private readonly dataSource: DataSource) {}

  async seedAllTables(): Promise<void> {
    console.log('Seed DB on test mode');
    
    try {
      await this.clearAllTables();
      await this.seedGenres();
      await this.seedMovies();
      await this.seedMovieGenres();
      
    } catch (error) {
      console.error('Error seeding test data:', error);
      throw error;
    }
  }

  async clearAllTables(): Promise<void> {    
    // Use DELETE instead of TRUNCATE to handle foreign key constraints properly
    await this.dataSource.query('DELETE FROM movie_genres');
    await this.dataSource.query('DELETE FROM movie');
    await this.dataSource.query('DELETE FROM genre');
  }

  async seedGenres(): Promise<void> {
    
    const genreRepo = this.dataSource.getRepository(Genre);
    const genres = genresData.map(genreData => {
      const genre = new Genre();
      genre.id = genreData.id;
      genre.tmdb_id = genreData.tmdb_id;
      genre.name = genreData.name;
      genre.created_at = new Date(genreData.created_at);
      genre.updated_at = new Date(genreData.updated_at);
      return genre;
    });

    await genreRepo.save(genres);
  }
  
  async seedMovies(): Promise<void> {
    
    const movieRepo = this.dataSource.getRepository(Movie);
    const movies = moviesData.map(movieData => {
      const movie = new Movie();
      movie.id = movieData.id;
      movie.tmdb_id = movieData.tmdb_id;
      movie.title = movieData.title;
      movie.overview = movieData.overview || '';
      movie.release_date = new Date(movieData.release_date);
      movie.poster_path = movieData.poster_path || '';
      movie.backdrop_path = movieData.backdrop_path || '';
      movie.popularity = movieData.popularity;
      movie.vote_average = movieData.vote_average;
      movie.vote_count = movieData.vote_count;
      movie.created_at = new Date(movieData.created_at);
      movie.updated_at = new Date(movieData.updated_at);
      return movie;
    });
    // Insert in batches of 100 for better performance
    const batchSize = 100;
    const chunks = chunk(movies, batchSize);
    for (const chunk of chunks) {
      await movieRepo.save(chunk as Movie[]);
    }
  }

  async seedMovieGenres(): Promise<void> {
    const movieGenreRepo = this.dataSource.getRepository(MovieGenre);
    const movieGenres = movieGenresData.map(relationData => {
      const movieGenre = new MovieGenre();
      movieGenre.id = relationData.id;
      movieGenre.movie_id = relationData.movie_id;
      movieGenre.genre_id = relationData.genre_id;
      return movieGenre;
    });

    // Insert in batches of 200 for better performance
    const batchSize = 200;
    for (let i = 0; i < movieGenres.length; i += batchSize) {
      const batch = movieGenres.slice(i, i + batchSize);
      await movieGenreRepo.save(batch);
    }
  }
} 