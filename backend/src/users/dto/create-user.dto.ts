import { IsString, IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    readonly name: string;

    @IsString()
    @IsNotEmpty()
    readonly login: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    readonly password: string;
}