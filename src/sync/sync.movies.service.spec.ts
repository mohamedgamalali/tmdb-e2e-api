import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { SyncMoviesService } from '../../src/sync/sync.movies.service';
import { Movie } from '../../src/movies/movies.entity';
import { Genre } from '../../src/genres/genre.entity';
import { MovieGenre } from '../../src/movies/MovieGenre.entity';
import { TmdbMoviesApi } from '../../src/tmdb/resources/movies.api';
import { mockedCacheService } from 'test/utils/redis-mock';
import { CacheService } from 'src/common/cache/cache.service';

function createRepoMock() {
    const qb: any = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orUpdate: jest.fn().mockReturnThis(),
        orIgnore: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue(undefined),
      };
    
    return {
      upsert: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(qb),
      manager: {
        transaction: jest.fn(),
      },
    };
}
describe('SyncMoviesService', () => {
  let service: SyncMoviesService;
  let movieRepoMock: jest.Mocked<Repository<Movie>>;
  let genreRepoMock: jest.Mocked<Repository<Genre>>;
  let movieGenreMock: jest.Mocked<Repository<MovieGenre>>;
  let tmdbMock: jest.Mocked<TmdbMoviesApi>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        SyncMoviesService,
        { provide: TmdbMoviesApi, useValue: { listPopularMovies: jest.fn() } },
        { provide: getRepositoryToken(Movie), useValue: createRepoMock() },
        { provide: getRepositoryToken(Genre), useValue: createRepoMock() },
        { provide: getRepositoryToken(MovieGenre), useValue: createRepoMock() },
        {
          provide: CacheService,
          useValue: mockedCacheService,
        }
      ],
    }).compile();

    service = module.get(SyncMoviesService);
    tmdbMock = module.get(TmdbMoviesApi) as any;
    movieRepoMock = module.get(getRepositoryToken(Movie));
    genreRepoMock = module.get(getRepositoryToken(Genre));
    movieGenreMock = module.get(getRepositoryToken(MovieGenre));

  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('upserts movies and replaces movie_genres relations', async () => {
    genreRepoMock.find.mockResolvedValue([{ id: 'genre1', tmdb_id: '28' } as any]);
    movieRepoMock.find.mockResolvedValue([{ id: 'movie1', tmdb_id: '603' } as any]);
    (movieGenreMock.manager as any) = { transaction: (fn: any) => fn({ getRepository: () => movieGenreMock }) };

    tmdbMock.listPopularMovies.mockResolvedValueOnce({
      results: [{ id: 603, title: 'The Matrix', genre_ids: [28] }],
    } as any);

    tmdbMock.listPopularMovies.mockResolvedValueOnce({ //making sure empty results breaks the loop
        results: [],
      } as any);

    await service.run({ pages: 1, TmdbGenresIds: ['28'] });

    expect(movieRepoMock.upsert).toHaveBeenCalled(); // insert … orUpdate …
    expect(movieRepoMock.find).toHaveBeenCalledWith(expect.objectContaining({
      where: { tmdb_id: In(['603']) },
    }));
    // delete old links + insert new links
    expect(movieGenreMock.createQueryBuilder).toHaveBeenCalled();
    expect(movieGenreMock.createQueryBuilder().delete).toHaveBeenCalled(); //movie genre deletion happend
    expect(movieGenreMock.createQueryBuilder().insert).toHaveBeenCalled(); //movie genre insertion happend
  });
});
