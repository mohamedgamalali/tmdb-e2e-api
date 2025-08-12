import { Controller, Get, Inject } from '@nestjs/common';
import { GenresService } from './genres.service';

@Controller('genres')
export class GenresController {
  @Inject(GenresService)
  private readonly genresService: GenresService;

  @Get()
  async getGenres() {
    return this.genresService.getGenres();
  }
}
