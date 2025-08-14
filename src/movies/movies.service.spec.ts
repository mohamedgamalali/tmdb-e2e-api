import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MoviesService } from './movies.service';
import { Movie } from './movies.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { createRepoMock, createMockMovie, createMockGenre, createQueryBuilderMock } from '../../test/utils/db-mock';
import { MovieRating } from './MovieRating.entity';
import { WatchList } from './WatchList.entity';

describe('MoviesService', () => {
  let service: MoviesService;
  let repository: jest.Mocked<Repository<Movie>>;
  let queryBuilder: any;
  let mockRatingRepo: any;
  let mockMovieRepo: any;
  let mockWatchListRepo: any;

  beforeEach(async () => {
    mockMovieRepo = createRepoMock();
    queryBuilder = createQueryBuilderMock();
    mockMovieRepo.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);

    mockRatingRepo = createRepoMock();
    mockRatingRepo.createQueryBuilder = jest.fn().mockReturnValue(createQueryBuilderMock());

    mockWatchListRepo = createRepoMock();
    mockWatchListRepo.createQueryBuilder = jest.fn().mockReturnValue(createQueryBuilderMock());

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: mockMovieRepo,
        },
        {
          provide: getRepositoryToken(MovieRating),
          useValue: mockRatingRepo,
        },
        {
          provide: getRepositoryToken(WatchList),
          useValue: mockWatchListRepo,
        },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
    repository = module.get<Repository<Movie>>(getRepositoryToken(Movie)) as jest.Mocked<Repository<Movie>>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMovies', () => {
    it('should return paginated movies with default parameters', async () => {
      const mockGenre = createMockGenre({ id: 'genre-1', name: 'Action' });
      const mockMovies = [
        createMockMovie({
          id: 'movie-1',
          title: 'Test Movie 1',
          movieGenres: [{ movie: null, genre: mockGenre, id: 'mg-1', movie_id: 'movie-1', genre_id: 'genre-1' }]
        }),
        createMockMovie({
          id: 'movie-2',
          title: 'Test Movie 2',
          movieGenres: [{ movie: null, genre: mockGenre, id: 'mg-2', movie_id: 'movie-2', genre_id: 'genre-1' }]
        }),
      ];
      const totalCount = 2;

      queryBuilder.getManyAndCount.mockResolvedValue([mockMovies, totalCount]);

      const query: GetMoviesDto = {};
      const result = await service.getMovies(query);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('movie');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('movie.movieGenres', 'movieGenre');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledWith('movieGenre.genre', 'genre');
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('movie.created_at', 'ASC');
      expect(queryBuilder.skip).toHaveBeenCalledWith(0); // (1-1) * 10
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
      expect(queryBuilder.getManyAndCount).toHaveBeenCalled();

      expect(result.data).toHaveLength(2);
      expect(result.data[0].genres).toEqual([{ id: mockGenre.id, name: mockGenre.name }]);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total).toBe(totalCount);
    });

    it('should apply search filter when search parameter is provided', async () => {
      const mockMovies = [createMockMovie({ title: 'Action Movie', movieGenres: [] })];
      const searchTerm = 'action';

      queryBuilder.getManyAndCount.mockResolvedValue([mockMovies, 1]);

      const query: GetMoviesDto = { search: searchTerm };
      await service.getMovies(query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'movie.title LIKE :search',
        { search: `%${searchTerm}%` }
      );
    });

    it('should not apply search filter when search parameter is empty', async () => {
      const mockMovies = [createMockMovie({ movieGenres: [] })];

      queryBuilder.getManyAndCount.mockResolvedValue([mockMovies, 1]);

      const query: GetMoviesDto = { search: '' };
      await service.getMovies(query);

      expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
        expect.stringContaining('LIKE'),
        expect.any(Object)
      );
    });

    it('should apply genre filter when genreIds are provided', async () => {
      const genreIds = ['genre-1', 'genre-2'];
      const mockMovies = [createMockMovie({ movieGenres: [] })];

      queryBuilder.getManyAndCount.mockResolvedValue([mockMovies, 1]);

      const query: GetMoviesDto = { genreIds };
      await service.getMovies(query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'EXISTS (SELECT 1 FROM movie_genres mg WHERE mg.movie_id = movie.id AND mg.genre_id IN (:...genreIds))',
        { genreIds }
      );
    });

    it('should not apply genre filter when genreIds array is empty', async () => {
      const mockMovies = [createMockMovie({ movieGenres: [] })];

      queryBuilder.getManyAndCount.mockResolvedValue([mockMovies, 1]);

      const query: GetMoviesDto = { genreIds: [] };
      await service.getMovies(query);

      expect(queryBuilder.andWhere).not.toHaveBeenCalledWith(
        expect.stringContaining('EXISTS'),
        expect.any(Object)
      );
    });

    it('should apply custom pagination parameters', async () => {
      const mockMovies = [createMockMovie({ movieGenres: [] })];
      const page = 3;
      const limit = 5;

      queryBuilder.getManyAndCount.mockResolvedValue([mockMovies, 15]);

      const query: GetMoviesDto = { page, limit };
      const result = await service.getMovies(query);

      expect(queryBuilder.skip).toHaveBeenCalledWith(10); // (3-1) * 5
      expect(queryBuilder.take).toHaveBeenCalledWith(5);
      expect(result.meta.page).toBe(page);
      expect(result.meta.limit).toBe(limit);
    });

    it('should apply custom sorting parameters', async () => {
      const mockMovies = [createMockMovie({ movieGenres: [] })];
      const sortBy = 'title';
      const sortOrder = 'desc';

      queryBuilder.getManyAndCount.mockResolvedValue([mockMovies, 1]);

      const query: GetMoviesDto = { sortBy, sortOrder };
      await service.getMovies(query);

      expect(queryBuilder.orderBy).toHaveBeenCalledWith('movie.title', 'DESC');
    });

    it('should transform movies to include genres array', async () => {
      const mockGenre1 = createMockGenre({ id: 'genre-1', name: 'Action' });
      const mockGenre2 = createMockGenre({ id: 'genre-2', name: 'Adventure' });
      
      const mockMovies = [
        createMockMovie({
          id: 'movie-1',
          title: 'Multi-genre Movie',
          movieGenres: [
            { movie: null, genre: mockGenre1, id: 'mg-1', movie_id: 'movie-1', genre_id: 'genre-1' },
            { movie: null, genre: mockGenre2, id: 'mg-2', movie_id: 'movie-1', genre_id: 'genre-2' }
          ]
        }),
      ];

      queryBuilder.getManyAndCount.mockResolvedValue([mockMovies, 1]);

      const query: GetMoviesDto = {};
      const result = await service.getMovies(query);

      expect(result.data[0].genres).toHaveLength(2);
      expect(result.data[0].genres).toEqual([
        { id: mockGenre1.id, name: mockGenre1.name },
        { id: mockGenre2.id, name: mockGenre2.name }
      ]);
      expect(result.data[0]).not.toHaveProperty('movieGenres');
    });

    it('should handle movies with no genres', async () => {
      const mockMovies = [
        createMockMovie({
          id: 'movie-1',
          title: 'Movie without genres',
          movieGenres: []
        }),
      ];

      queryBuilder.getManyAndCount.mockResolvedValue([mockMovies, 1]);

      const query: GetMoviesDto = {};
      const result = await service.getMovies(query);

      expect(result.data[0].genres).toEqual([]);
    });

    it('should handle movies with null movieGenres', async () => {
      const mockMovies = [
        createMockMovie({
          id: 'movie-1',
          title: 'Movie with null genres',
          movieGenres: null
        }),
      ];

      queryBuilder.getManyAndCount.mockResolvedValue([mockMovies, 1]);

      const query: GetMoviesDto = {};
      const result = await service.getMovies(query);

      expect(result.data[0].genres).toEqual([]);
    });

    it('should return empty result when no movies match', async () => {
      queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const query: GetMoviesDto = { search: 'nonexistent' };
      const result = await service.getMovies(query);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('should handle repository errors gracefully', async () => {
      const error = new Error('Database connection failed');
      queryBuilder.getManyAndCount.mockRejectedValue(error);

      const query: GetMoviesDto = {};

      await expect(service.getMovies(query)).rejects.toThrow('Database connection failed');
    });

    it('should work with all parameters combined', async () => {
      const mockGenre = createMockGenre({ id: 'genre-1', name: 'Action' });
      const mockMovies = [
        createMockMovie({
          id: 'movie-1',
          title: 'Action Movie',
          movieGenres: [{ movie: null, genre: mockGenre, id: 'mg-1', movie_id: 'movie-1', genre_id: 'genre-1' }]
        }),
      ];
      const totalCount = 1;

      queryBuilder.getManyAndCount.mockResolvedValue([mockMovies, totalCount]);

      const query: GetMoviesDto = {
        page: 2,
        limit: 5,
        search: 'action',
        sortBy: 'title',
        sortOrder: 'desc',
        genreIds: ['genre-1', 'genre-2'],
      };

      const result = await service.getMovies(query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'movie.title LIKE :search',
        { search: '%action%' }
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'EXISTS (SELECT 1 FROM movie_genres mg WHERE mg.movie_id = movie.id AND mg.genre_id IN (:...genreIds))',
        { genreIds: ['genre-1', 'genre-2'] }
      );
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('movie.title', 'DESC');
      expect(queryBuilder.skip).toHaveBeenCalledWith(5); // (2-1) * 5
      expect(queryBuilder.take).toHaveBeenCalledWith(5);

      const { movieGenres, ...expectedMovieData } = mockMovies[0];
      expect(result.data).toEqual([{
        ...expectedMovieData,
        genres: [{ id: mockGenre.id, name: mockGenre.name }],
        average_internal_rating: 0
      }]);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(5);
      expect(result.meta.total).toBe(totalCount);
    });

    it('should correctly build query chain', async () => {
      const mockMovies = [createMockMovie({ movieGenres: [] })];
      queryBuilder.getManyAndCount.mockResolvedValue([mockMovies, 1]);

      const query: GetMoviesDto = { search: 'test', genreIds: ['genre-1'] };
      await service.getMovies(query);

      // Verify the query builder chain was called in the correct order
      expect(repository.createQueryBuilder).toHaveBeenCalledWith('movie');
      expect(queryBuilder.leftJoinAndSelect).toHaveBeenCalledTimes(3); //2 for movieGenres and 1 for movieRatings
      expect(queryBuilder.andWhere).toHaveBeenCalledTimes(2);
      expect(queryBuilder.orderBy).toHaveBeenCalledTimes(1);
      expect(queryBuilder.skip).toHaveBeenCalledTimes(1);
      expect(queryBuilder.take).toHaveBeenCalledTimes(1);
      expect(queryBuilder.getManyAndCount).toHaveBeenCalledTimes(1);
    });
  });

  describe('rateMovie', () => {
    it('should rate a movie', async () => {
      const mockMovie = createMockMovie({ movieGenres: [] });
      mockMovieRepo.findOne.mockResolvedValue(mockMovie);
      await service.rateMovie({ movieId: mockMovie.id, userId: 'user-1', rating: 5 });

      expect(mockMovieRepo.findOne).toHaveBeenCalledWith({ where: { id: mockMovie.id }});
      expect(mockRatingRepo.upsert).toHaveBeenCalledWith({ movie_id: mockMovie.id, user_id: 'user-1', rating: 5 }, { conflictPaths: ['movie_id', 'user_id'] });
    });

    it('should throw an error if the movie is not found', async () => {
      mockMovieRepo.findOne.mockResolvedValue(null);
      await expect(service.rateMovie({ movieId: 'non-existent-id', userId: 'user-1', rating: 5 })).rejects.toThrow('Movie not found');
    });
  });

  describe('watchList', () => {
    it('should add a movie to the watch list', async () => {
      const mockMovie = createMockMovie({ movieGenres: [] });
      mockMovieRepo.findOne.mockResolvedValue(mockMovie);
      await service.addToWatchList({ movieId: mockMovie.id, userId: 'user-1' });

      expect(mockMovieRepo.findOne).toHaveBeenCalledWith({ where: { id: mockMovie.id }});
      expect(mockWatchListRepo.create).toHaveBeenCalledWith({ movie_id: mockMovie.id, user_id: 'user-1' });
      expect(mockWatchListRepo.save).toHaveBeenCalledTimes(1);
    });
  });
});
