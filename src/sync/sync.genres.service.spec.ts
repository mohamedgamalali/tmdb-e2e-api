import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SyncGenresService } from './sync.genres.service';
import { Genre } from '../genres/genre.entity';
import { TmdbGenresApi } from '../tmdb/resources/genres.api';
import { CacheService } from 'src/common/cache/cache.service';
import { mockedCacheService } from 'test/utils/redis-mock';

function createRepoMock() {
  return {
    upsert: jest.fn(),
  };
}

describe('SyncGenresService', () => {
  let syncGenresService: SyncGenresService;
  let tmdb: { listGenres: jest.Mock };
  let genresRepo;

  beforeEach(async () => {
    tmdb = {
      listGenres: jest.fn(),
    };

    genresRepo = createRepoMock();

    const moduleRef = await Test.createTestingModule({
      providers: [
        SyncGenresService,
        { provide: TmdbGenresApi, useValue: tmdb },
        { provide: getRepositoryToken(Genre), useValue: genresRepo },
        {
          provide: CacheService,
          useValue: mockedCacheService,
        }
      ],
    }).compile();

    syncGenresService = moduleRef.get(SyncGenresService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should upsert and normalize genres', async () => {
    const raw = [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
    ];

    tmdb.listGenres.mockResolvedValueOnce({
      genres: raw,
    });
    (genresRepo.upsert as jest.Mock).mockResolvedValueOnce({ raw });
    const genres = await syncGenresService.run();

    expect(genres).toHaveLength(2);

    expect(genresRepo.upsert).toHaveBeenCalledTimes(1);

    // insure payload is mapped correctly
    expect(genresRepo.upsert).toHaveBeenCalledWith(
      [
        { tmdb_id: '28', name: 'Action' },
        { tmdb_id: '12', name: 'Adventure' },
      ],
      { conflictPaths: ['tmdb_id'] },
    );

  });

  it('should handle empty list and return empty array', async () => {
    tmdb.listGenres.mockResolvedValueOnce({ genres: [] });
    (genresRepo.upsert as jest.Mock).mockResolvedValueOnce({ raw: [] });
    const genres = await syncGenresService.run();

    expect(genres).toHaveLength(0);
  });
});