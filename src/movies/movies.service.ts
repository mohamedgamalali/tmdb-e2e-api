import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './movies.entity';
import { Repository } from 'typeorm';
import { PaginatedResponseDto } from 'src/common/dto';
import { GetMoviesDto } from './dto/get-movies.dto';

@Injectable()
export class MoviesService {
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>;

    async getMovies(query: GetMoviesDto): Promise<PaginatedResponseDto<any>> {
        const { page = 1, limit = 10, search, sortBy = 'created_at', sortOrder = 'asc', genreIds } = query;
        const queryBuilder = this.movieRepository.createQueryBuilder('movie')
            .leftJoinAndSelect('movie.movieGenres', 'movieGenre')
            .leftJoinAndSelect('movieGenre.genre', 'genre');

        if (search) {
            queryBuilder.andWhere('movie.title LIKE :search', { search: `%${search}%` });
        }

        if (genreIds && genreIds.length > 0) {
            queryBuilder.andWhere('EXISTS (SELECT 1 FROM movie_genres mg WHERE mg.movie_id = movie.id AND mg.genre_id IN (:...genreIds))', { genreIds });
        }

        queryBuilder.orderBy(`movie.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

        const [movies, total] = await queryBuilder.skip((page - 1) * limit).take(limit).getManyAndCount();

        const moviesWithGenres = movies.map(movie => {
            const { movieGenres, ...movieData } = movie;
            return {
                ...movieData,
                genres: movieGenres?.map(mg => ({
                    id: mg.genre.id,
                    name: mg.genre.name
                })) || []
            };
        });

        return new PaginatedResponseDto(moviesWithGenres, page, limit, total);
    }
}
