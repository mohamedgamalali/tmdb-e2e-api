import { Controller, Get, Inject, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetMoviesDto } from './dto/get-movies.dto';

@ApiTags('movies')
@Controller('movies')
export class MoviesController {
    @Inject(MoviesService)
    private readonly moviesService: MoviesService;

    @Get()
    @ApiOperation({ summary: 'Get movies with pagination', description: 'Retrieve a paginated list of movies with optional search and sorting' })
    async getMovies(@Query() query: GetMoviesDto) {
        return this.moviesService.getMovies(query);
    }
}
