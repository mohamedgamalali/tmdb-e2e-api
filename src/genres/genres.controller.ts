import { Controller, Get, Inject, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { GenresService } from './genres.service';
import { PaginationDto } from 'src/common/dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GenresResponseDto } from './dto';

@ApiTags('genres')
@Controller('genres')
export class GenresController {
  @Inject(GenresService)
  private readonly genresService: GenresService;

  @Get()
  @ApiOperation({ 
    summary: 'Get genres with pagination',
    description: 'Retrieve a paginated list of movie genres with optional search and sorting'
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved genres',
    type: GenresResponseDto
  })
  async getGenres(@Query() query: PaginationDto) {
    return this.genresService.getGenres(query);
  }
}
