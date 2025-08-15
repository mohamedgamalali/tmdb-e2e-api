import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetMoviesDto } from './dto/get-movies.dto';
import { RateMovieDto } from './dto/rate-movie.dto';
import { AddToWatchListDto } from './dto/add-to-watchlist.dto';
import { GetWatchListDto } from './dto/get-watchlist-dto';
import { CacheService } from 'src/common/cache/cache.service';
import { CacheKeysMap } from 'src/common/cache/keys';
import { PaginatedResponseDto } from 'src/common/dto';

@ApiTags('movies')
@Controller('movies')
export class MoviesController {
    @Inject(MoviesService)
    private readonly moviesService: MoviesService;
    
    @Inject(CacheService)
    private readonly cacheService: CacheService;

    @Get()
    @ApiOperation({ summary: 'Get movies with pagination', description: 'Retrieve a paginated list of movies with optional search and sorting' })
    async getMovies(@Query() query: GetMoviesDto): Promise<PaginatedResponseDto<any>> {
        const cachedMovies = await this.cacheService.get(CacheKeysMap.GET_MOVIES, query);
        if (cachedMovies) {
            return JSON.parse(cachedMovies);
        }
        const res = await this.moviesService.getMovies(query);
        await this.cacheService.set(CacheKeysMap.GET_MOVIES, query, res, 60 * 5);
        return res;
    }

    @Post('rate')
    @ApiOperation({ summary: 'Rate a movie', description: 'Rate a movie with a rating & user id' })
    async rateMovie(@Body() body: RateMovieDto) {
        const res = await this.moviesService.rateMovie(body);
        await this.cacheService.delByPrefix(CacheKeysMap.GET_MOVIES);
        await this.cacheService.delByPrefix(CacheKeysMap.GET_WATCH_LIST);
        return res;
    }

    @Post('watchlist')
    @ApiOperation({ summary: 'Add a movie to watch list', description: 'Add a movie to watch list with a movie id & user id' })
    async addToWatchList(@Body() body: AddToWatchListDto) {
        const res = await this.moviesService.addToWatchList(body);
        await this.cacheService.delByPrefix(CacheKeysMap.GET_WATCH_LIST);
        return res;
    }

    @Get('watchlist')
    @ApiOperation({ summary: 'Get watch list', description: 'Get watch list with a user id' })
    async getWatchList(@Query() query: GetWatchListDto) {
        const cachedWatchList = await this.cacheService.get(CacheKeysMap.GET_WATCH_LIST, query);
        if (cachedWatchList) {
            return JSON.parse(cachedWatchList);
        }
        const res = await this.moviesService.getWatchList(query);
        await this.cacheService.set(CacheKeysMap.GET_WATCH_LIST, query, res, 60 * 5);
        return res;
    }
}
