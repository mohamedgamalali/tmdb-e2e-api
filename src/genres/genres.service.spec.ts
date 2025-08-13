import { Test, TestingModule } from '@nestjs/testing';
import { GenresService } from './genres.service';

describe('GenresService', () => {
  let service: GenresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{
        provide: GenresService,
        useValue: {
          getGenres: jest.fn(),
        },
      }],
    }).compile();

    service = module.get<GenresService>(GenresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
