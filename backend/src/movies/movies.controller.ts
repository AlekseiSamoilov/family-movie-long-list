import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from "@nestjs/common";
import { MoviesService } from "./movies.service";
import { CreateMovieDto } from "./dto/create-movie.dto";
import { Movie } from "./movie.schema";
import { UpdateMovieDto } from "./dto/update-movie.dto";

@Controller('movie')
export class MovieController {
    constructor(private readonly movieService: MoviesService) { }

    @Post()
    async create(@Body() createMovieDto: CreateMovieDto, @Req() req: any): Promise<Movie> {
        const userId = req.user.id;
        const groupId = req.body.groupId;
        return this.movieService.create(createMovieDto, userId, groupId)
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

    @Get('group/:groupId')
    async findMoviesByGroup(@Param('groupId') groupId: string) {
        return this.movieService.findMovieByGroup(groupId)
    }
}