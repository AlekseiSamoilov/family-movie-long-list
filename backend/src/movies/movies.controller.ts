import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { MoviesService } from "./movies.service";
import { CreateMovieDto } from "./dto/create-movie.dto";
import { Movie } from "./movie.schema";
import { UpdateMovieDto } from "./dto/update-movie.dto";

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

    @Get(':id')
    async findOne(@Param('id') id: string) {
        ;
        return this.movieService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
        return this.movieService.updateMovie(id, updateMovieDto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.movieService.delete(id);
    }
}