import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class UpdateMovieDto {
    @IsString()
    @IsNotEmpty()
    title?: string;

    @IsString()
    @IsNotEmpty()
    genre?: string;

    @IsNumber()
    @IsNotEmpty()
    addedAt?: Date;
}
