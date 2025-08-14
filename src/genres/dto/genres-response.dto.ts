import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponseDto } from '../../common/dto';
import { Genre } from '../genre.entity';
import { GenreDto } from './genre.dto';

export class GenresResponseDto extends PaginatedResponseDto<Genre> {
  @ApiProperty({
    description: 'Array of genre objects',
    type: [GenreDto],
    example: [
      {
        id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
        tmdb_id: "28",
        name: "Action",
        created_at: "2025-08-12T23:17:06.701Z",
        updated_at: "2025-08-13T02:24:49.347Z"
      },
      {
        id: "8ed21c2b-ba5b-4759-9736-052862865db3",
        tmdb_id: "18",
        name: "Drama",
        created_at: "2025-08-12T23:17:06.701Z",
        updated_at: "2025-08-13T02:24:49.347Z"
      }
    ]
  })
  data: Genre[];
} 