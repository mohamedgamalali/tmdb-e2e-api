import { ApiProperty } from "@nestjs/swagger";

export class GenreDto {
  @ApiProperty({
    description: 'The ID of the genre',
    example: '1',
  })
  id: string;

  @ApiProperty({
    description: 'The TMDB ID of the genre',
    example: '28',
  })
  tmdb_id: string;

  @ApiProperty({
    description: 'The name of the genre',
    example: 'Action',
  })
  name: string;

  @ApiProperty({
    description: 'The date and time the genre was created',
    example: '2024-01-15T10:30:00Z',
  })
  created_at: Date;

  @ApiProperty({
    description: 'The date and time the genre was updated',
    example: '2024-01-15T10:30:00Z',
  })
  updated_at: Date;
}