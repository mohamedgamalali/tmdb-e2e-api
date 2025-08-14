import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsUUID, Max, Min } from "class-validator";

export class RateMovieDto {
    @ApiProperty({
        description: 'The user ID',
        example: '1',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    userId: string;

    @ApiProperty({
        description: 'The movie ID',
        example: '1',
        required: true,
    })
    @IsNotEmpty()
    @IsUUID('4')
    movieId: string;

    @ApiProperty({
        description: 'The rating',
        example: 5,
        required: true,
    })
    @IsNotEmpty()
    @IsNumber({ maxDecimalPlaces: 1 }, { message: 'Rating must be a number with up to 1 decimal place' })
    @Min(0.5, { message: 'Rating must be between 0.5 and 5' })
    @Max(5, { message: 'Rating must be between 0.5 and 5' })
    rating: number;
}