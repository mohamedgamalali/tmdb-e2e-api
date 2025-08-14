import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class GetWatchListDto {
    @ApiProperty({
        description: 'The user ID',
        example: '1',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    userId: string;

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
}