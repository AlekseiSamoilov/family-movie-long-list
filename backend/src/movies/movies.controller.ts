import { Body, Controller, Get, Post } from "@nestjs/common";
import { MoviesService } from "./movies.service";
import { CreateMovieDto } from "./dto/create-movie.dto";
import { Movie } from "./movie.schema";

@Controller('movie')
export class MovieController {
    constructor(private readonly movieService: MoviesService) { }

    @Post()
    async create(@Body() createMovieDto: CreateMovieDto): Promise<Movie> {
        return this.movieService.create(createMovieDto);
    }

    @Get()
    async findAll(): Promise<Movie[]> {
        return this.movieService.findAll();
    }
}