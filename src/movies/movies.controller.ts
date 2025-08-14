import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetMoviesDto } from './dto/get-movies.dto';
import { RateMovieDto } from './dto/rate-movie.dto';
import { AddToWatchListDto } from './dto/add-to-watchlist.dto';
import { GetWatchListDto } from './dto/get-watchlist-dto';

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

    @Post('rate')
    @ApiOperation({ summary: 'Rate a movie', description: 'Rate a movie with a rating & user id' })
    async rateMovie(@Body() body: RateMovieDto) {
        return this.moviesService.rateMovie(body);
    }

    @Post('watchlist')
    @ApiOperation({ summary: 'Add a movie to watch list', description: 'Add a movie to watch list with a movie id & user id' })
    async addToWatchList(@Body() body: AddToWatchListDto) {
        return this.moviesService.addToWatchList(body);
    }

    @Get('watchlist')
    @ApiOperation({ summary: 'Get watch list', description: 'Get watch list with a user id' })
    async getWatchList(@Query() query: GetWatchListDto) {
        return this.moviesService.getWatchList(query);
    }
}
