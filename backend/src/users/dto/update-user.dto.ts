import { IsOptional, IsString, MinLength } from "class-validator";

export class UpdateUserDto {
    @IsString()
    @IsOptional()
    readonly name?: string;

    @IsString()
    @IsOptional()
    readonly login?: string;

    @IsString()
    @IsOptional()
    @MinLength(6)
    readonly password: string;
}