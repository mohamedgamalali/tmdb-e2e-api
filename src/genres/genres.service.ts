import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Genre } from './genre.entity';
import { PaginationDto } from '../common/dto';
import { PaginatedResponseDto } from '../common/dto';

@Injectable()
export class GenresService {
  constructor(
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
  ) {}

  async getGenres(queryDto: PaginationDto): Promise<PaginatedResponseDto<Genre>> {
    const { 
      page = 1, 
      limit = 10,
      search,
      sortBy = 'created_at', 
      sortOrder = 'desc'
    } = queryDto;
    
    const queryBuilder = this.genreRepository.createQueryBuilder('genre');
    
    if (search) {
      queryBuilder.andWhere('LOWER(genre.name) LIKE LOWER(:search)', {
        search: `%${search}%`
      });
    }
    
    queryBuilder.orderBy(`genre.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');
    
    const total = await queryBuilder.getCount();
    
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);
    
    const genres = await queryBuilder.getMany();
    
    return new PaginatedResponseDto(genres, page, limit, total);
  }

}
