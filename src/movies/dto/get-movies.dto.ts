import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsOptional, IsUUID } from "class-validator";
import { PaginationDto } from "src/common/dto";

export class GetMoviesDto extends PaginationDto {
    @ApiProperty({
        description: 'An array of internal genre IDs',
        example: ['f47ac10b-58cc-4372-a567-0e02b2c3d479', '8ed21c2b-ba5b-4759-9736-052862865db3'],
        required: false,
    })
    @IsOptional()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return [value];
        }
        return value;
    })
    @IsArray()
    @IsUUID(4, { each: true })
    genreIds?: string[];
}