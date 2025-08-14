import { IsOptional, IsNumber, IsString, Min, Max, IsIn } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PaginationDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
  })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiProperty({
    description: 'Limit number of items per page',
    example: 10,
    required: false,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({
    allowNaN: false,
    allowInfinity: false,
  })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(50, { message: 'Limit cannot exceed 50' })
  limit?: number = 10;

  @ApiProperty({
    description: 'Search query for record name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiProperty({
    description: 'Sort by field',
    example: 'created_at',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.toLowerCase())
  sortBy?: string = 'created_at';

  @ApiProperty({
    description: 'Sort order',
    example: 'desc',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'], { message: 'Invalid sortOrder value, must be asc or desc' })
  @Transform(({ value }) => value?.toLowerCase())
  sortOrder?: 'asc' | 'desc' = 'desc';
} 