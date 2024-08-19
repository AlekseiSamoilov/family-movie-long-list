import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UpdateMovieDto {
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsString()
    @IsNotEmpty()
    genre?: string;

    @IsNumber()
    @IsNotEmpty()
    addedAt?: Date;
}
