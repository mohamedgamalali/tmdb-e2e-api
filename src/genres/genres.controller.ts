import { Controller, Get, Inject, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { GenresService } from './genres.service';
import { PaginationDto } from 'src/common/dto';

@Controller('genres')
export class GenresController {
  @Inject(GenresService)
  private readonly genresService: GenresService;

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getGenres(@Query() query: PaginationDto) {
    return this.genresService.getGenres(query);
  }
}
