import { Controller, Get, Inject, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { GenresService } from './genres.service';
import { PaginatedResponseDto, PaginationDto } from 'src/common/dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GenresResponseDto } from './dto';
import { CacheService } from 'src/common/cache/cache.service';
import { CacheKeysMap } from 'src/common/cache/keys';
import { Genre } from './genre.entity';

@ApiTags('genres')
@Controller('genres')
export class GenresController {
  @Inject(GenresService)
  private readonly genresService: GenresService;

  @Inject(CacheService)
  private readonly cacheService: CacheService;

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
  async getGenres(@Query() query: PaginationDto): Promise<PaginatedResponseDto<Genre>> {
    // await this.cacheService.delByPrefix(CacheKeysMap.GET_GENRES);
    
    const cachedGenres = await this.cacheService.get(CacheKeysMap.GET_GENRES, query);
    if (cachedGenres) {
      return JSON.parse(cachedGenres) as PaginatedResponseDto<Genre>;
    }
    const genres = await this.genresService.getGenres(query);
    await this.cacheService.set(CacheKeysMap.GET_GENRES, query, genres, 60 * 5);
    return genres;
  }
}
