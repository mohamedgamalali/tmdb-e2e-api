import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './movies.entity';
import { Repository } from 'typeorm';
import { PaginatedResponseDto } from 'src/common/dto';
import { GetMoviesDto } from './dto/get-movies.dto';
import { RateMovieDto } from './dto/rate-movie.dto';
import { MovieRating } from './MovieRating.entity';
import { AddToWatchListDto } from './dto/add-to-watchlist.dto';
import { WatchList } from './WatchList.entity';
import { GetWatchListDto } from './dto/get-watchlist-dto';

@Injectable()
export class MoviesService {
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>;

    @InjectRepository(MovieRating)
    private readonly movieRatingRepository: Repository<MovieRating>;

    @InjectRepository(WatchList)
    private readonly watchListRepository: Repository<WatchList>;

    async getMovies(query: GetMoviesDto): Promise<PaginatedResponseDto<any>> {
        const { page = 1, limit = 10, search, sortBy = 'created_at', sortOrder = 'asc', genreIds } = query;
        const queryBuilder = this.movieRepository.createQueryBuilder('movie')
            .leftJoinAndSelect('movie.movieGenres', 'movieGenre')
            .leftJoinAndSelect('movieGenre.genre', 'genre')
            .leftJoinAndSelect('movie.movieRatings', 'movieRating');

        if (search) {
            queryBuilder.andWhere('movie.title LIKE :search', { search: `%${search}%` });
        }

        if (genreIds && genreIds.length > 0) {
            queryBuilder.andWhere('EXISTS (SELECT 1 FROM movie_genres mg WHERE mg.movie_id = movie.id AND mg.genre_id IN (:...genreIds))', { genreIds });
        }

        queryBuilder.orderBy(`movie.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

        const [movies, total] = await queryBuilder.skip((page - 1) * limit).take(limit).getManyAndCount();

        const moviesWithGenres = this.movieMapper(movies);

        return new PaginatedResponseDto(moviesWithGenres, page, limit, total);
    }

    async rateMovie(body: RateMovieDto) {
        const { movieId, userId, rating } = body;
        const movie = await this.movieRepository.findOne({ where: { id: movieId } });
        if (!movie) {
            throw new NotFoundException('Movie not found');
        }

        //upserting so user can rate the same movie multiple times
        await this.movieRatingRepository.upsert({ movie_id: movieId, user_id: userId, rating }, { conflictPaths: ['movie_id', 'user_id'] });

        return { message: 'Movie rated successfully' };
    }

    async addToWatchList(body: AddToWatchListDto) {
        const { movieId, userId } = body;
        const movie = await this.movieRepository.findOne({ where: { id: movieId } });
        if (!movie) {
            throw new NotFoundException('Movie not found');
        }

        const existingWatchList = await this.watchListRepository.findOne({ where: { movie_id: movieId, user_id: userId } });
        if (existingWatchList) {
            throw new BadRequestException('Movie already in watch list');
        }

        const newWatchList = this.watchListRepository.create({ movie_id: movieId, user_id: userId });
        await this.watchListRepository.save(newWatchList);

        return { message: 'Movie added to watch list successfully', data: newWatchList };
    }

    async getWatchList(query: GetWatchListDto) {
        const { page = 1, limit = 10, userId } = query;
        const [watchList, total] = await this.watchListRepository.createQueryBuilder('watchList')
            .leftJoinAndSelect('watchList.movie', 'movie')
            .leftJoinAndSelect('movie.movieGenres', 'movieGenre')
            .leftJoinAndSelect('movieGenre.genre', 'genre')
            .leftJoinAndSelect('movie.movieRatings', 'movieRating')
            .where('watchList.user_id = :userId', { userId })
            .skip((page - 1) * limit).take(limit).getManyAndCount();
        const moviesWithGenres = watchList.map(w => ({
            ...w,
            movie: this.movieMapper([w.movie])[0]
        }));
        return new PaginatedResponseDto(moviesWithGenres, page, limit, total);
    }

    private movieMapper(movies: Movie[]) {
        return movies.map(movie => {
            const { movieGenres, ...movieData } = movie;
            return {
                ...movieData,
                genres: movieGenres?.map(mg => ({
                    id: mg.genre.id,
                    name: mg.genre.name,
                })) || [],
                average_internal_rating: movie?.movieRatings?.length > 0 ? movie.movieRatings.reduce((sum, rating) => sum + rating.rating, 0) / movie.movieRatings.length : 0
            };
        });
    }
}
