import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GenresService } from './genres.service';
import { Genre } from './genre.entity';
import { PaginationDto } from '../common/dto';
import { createRepoMock, createMockGenre, createQueryBuilderMock } from '../../test/utils/db-mock';

describe('GenresService', () => {
  let service: GenresService;
  let repository: jest.Mocked<Repository<Genre>>;
  let queryBuilder: any;

  beforeEach(async () => {
    const mockRepo = createRepoMock();
    queryBuilder = createQueryBuilderMock();
    mockRepo.createQueryBuilder = jest.fn().mockReturnValue(queryBuilder);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenresService,
        {
          provide: getRepositoryToken(Genre),
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get<GenresService>(GenresService);
    repository = module.get<Repository<Genre>>(getRepositoryToken(Genre)) as jest.Mocked<Repository<Genre>>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGenres', () => {
    it('should return paginated genres with default parameters', async () => {
      const mockGenres = [
        createMockGenre({ id: '1', name: 'Action' }),
        createMockGenre({ id: '2', name: 'Comedy' }),
      ];
      const totalCount = 2;

      queryBuilder.getCount.mockResolvedValue(totalCount);
      queryBuilder.getMany.mockResolvedValue(mockGenres);

      const query: PaginationDto = {};
      const result = await service.getGenres(query);

      expect(repository.createQueryBuilder).toHaveBeenCalledWith('genre');
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('genre.created_at', 'DESC');
      expect(queryBuilder.skip).toHaveBeenCalledWith(0); //first page
      expect(queryBuilder.take).toHaveBeenCalledWith(10);
      expect(queryBuilder.getCount).toHaveBeenCalled();
      expect(queryBuilder.getMany).toHaveBeenCalled();

      expect(result.data).toEqual(mockGenres);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.total).toBe(totalCount);
    });

    it('should apply search filter when search parameter is provided', async () => {
      const mockGenres = [createMockGenre({ name: 'Action' })];
      const searchTerm = 'act';

      queryBuilder.getCount.mockResolvedValue(1);
      queryBuilder.getMany.mockResolvedValue(mockGenres);

      const query: PaginationDto = { search: searchTerm };
      await service.getGenres(query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(genre.name) LIKE LOWER(:search)',
        { search: `%${searchTerm}%` }
      );
    });

    it('should not apply search filter when search parameter is empty', async () => {
      const mockGenres = [createMockGenre()];

      queryBuilder.getCount.mockResolvedValue(1);
      queryBuilder.getMany.mockResolvedValue(mockGenres);

      const query: PaginationDto = { search: '' };
      await service.getGenres(query);

      expect(queryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('should apply custom pagination parameters', async () => {
      const mockGenres = [createMockGenre()];
      const page = 3;
      const limit = 5;

      queryBuilder.getCount.mockResolvedValue(15);
      queryBuilder.getMany.mockResolvedValue(mockGenres);

      const query: PaginationDto = { page, limit };
      const result = await service.getGenres(query);

      expect(queryBuilder.skip).toHaveBeenCalledWith(10); // (3-1) * 5
      expect(queryBuilder.take).toHaveBeenCalledWith(5);
      expect(result.meta.page).toBe(page);
      expect(result.meta.limit).toBe(limit);
    });

    it('should apply custom sorting parameters', async () => {
      const mockGenres = [createMockGenre()];
      const sortBy = 'name';
      const sortOrder = 'desc';

      queryBuilder.getCount.mockResolvedValue(1);
      queryBuilder.getMany.mockResolvedValue(mockGenres);

      const query: PaginationDto = { sortBy, sortOrder };
      await service.getGenres(query);

      expect(queryBuilder.orderBy).toHaveBeenCalledWith('genre.name', 'DESC');
    });

    it('should handle case-insensitive search', async () => {
      const mockGenres = [createMockGenre({ name: 'ACTION' })];
      const searchTerm = 'action';

      queryBuilder.getCount.mockResolvedValue(1);
      queryBuilder.getMany.mockResolvedValue(mockGenres);

      const query: PaginationDto = { search: searchTerm };
      await service.getGenres(query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(genre.name) LIKE LOWER(:search)',
        { search: `%${searchTerm}%` }
      );
    });

    it('should return empty result when no genres match', async () => {
      queryBuilder.getCount.mockResolvedValue(0);
      queryBuilder.getMany.mockResolvedValue([]);

      const query: PaginationDto = { search: 'nonexistent' };
      const result = await service.getGenres(query);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
    });

    it('should calculate correct pagination with different page sizes', async () => {
      const mockGenres = [createMockGenre()];
      const totalCount = 25;
      const page = 2;
      const limit = 8;

      queryBuilder.getCount.mockResolvedValue(totalCount);
      queryBuilder.getMany.mockResolvedValue(mockGenres);

      const query: PaginationDto = { page, limit };
      const result = await service.getGenres(query);

      expect(queryBuilder.skip).toHaveBeenCalledWith(8); // (2-1) * 8
      expect(queryBuilder.take).toHaveBeenCalledWith(8);
      expect(result.meta.totalPages).toBe(4); // Math.ceil(25/8)
    });

    it('should handle repository errors gracefully', async () => {
      const error = new Error('Database connection failed');
      queryBuilder.getCount.mockRejectedValue(error);

      const query: PaginationDto = {};

      await expect(service.getGenres(query)).rejects.toThrow('Database connection failed');
    });

    it('should work with all parameters combined', async () => {
      const mockGenres = [
        createMockGenre({ id: '1', name: 'Action' }),
        createMockGenre({ id: '2', name: 'Adventure' }),
      ];
      const totalCount = 2;

      queryBuilder.getCount.mockResolvedValue(totalCount);
      queryBuilder.getMany.mockResolvedValue(mockGenres);

      const query: PaginationDto = {
        page: 2,
        limit: 5,
        search: 'act',
        sortBy: 'name',
        sortOrder: 'desc',
      };

      const result = await service.getGenres(query);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'LOWER(genre.name) LIKE LOWER(:search)',
        { search: '%act%' }
      );
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('genre.name', 'DESC');
      expect(queryBuilder.skip).toHaveBeenCalledWith(5); // (2-1) * 5
      expect(queryBuilder.take).toHaveBeenCalledWith(5);

      expect(result.data).toEqual(mockGenres);
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(5);
      expect(result.meta.total).toBe(totalCount);
    });
  });
});
