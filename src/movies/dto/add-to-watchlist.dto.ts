import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class AddToWatchListDto {
    @ApiProperty({
        description: 'The movie ID',
        example: '1',
        required: true,
    })
    @IsNotEmpty()
    @IsUUID('4')
    movieId: string;

    @ApiProperty({
        description: 'The user ID',
        example: '1',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    userId: string;
}