import { Test, TestingModule } from '@nestjs/testing';
import { GenresController } from './genres.controller';
import { GenresService } from './genres.service';

describe('GenresController', () => {
  let controller: GenresController;
  let service: jest.Mocked<GenresService>;

  beforeEach(async () => {
    const mockGenresService = {
      getGenres: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [GenresController],
      providers: [
        {
          provide: GenresService,
          useValue: mockGenresService,
        },
      ],
    }).compile();

    controller = module.get<GenresController>(GenresController);
    service = module.get<GenresService>(GenresService) as jest.Mocked<GenresService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call getGenres with query parameters', async () => {
    const mockResult = { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0, hasNextPage: false, hasPrevPage: false } };
    service.getGenres.mockResolvedValue(mockResult);

    const queryDto = { page: 1, limit: 10 };
    const result = await controller.getGenres(queryDto);

    expect(service.getGenres).toHaveBeenCalledWith(queryDto);
    expect(result).toBe(mockResult);
  });
});
