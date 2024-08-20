import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Movie } from "./movie.schema";
import { Model } from "mongoose";
import { CreateMovieDto } from "./dto/create-movie.dto";


@Injectable()
export class MoviesService {
    constructor(@InjectModel(Movie.name) private movieModel: Model<Movie>) { }

    async create(createMovieDto: CreateMovieDto): Promise<Movie> {
        const newMovie = new this.movieModel(createMovieDto);
        return newMovie.save();
    }

    async findAll(): Promise<Movie[]> {
        return this.movieModel.find().exec();
    }

    async findOne(id: string): Promise<Movie> {
        const movie = await this.movieModel.findById(id).exec();
        if (!movie) {
            throw new NotFoundException(`Movie whith ID: ${id} not found`);
        }
        return movie;
    }

    async findByMovieName(movieName: string): Promise<Movie> {
        return this.movieModel.findOne({ movieName })
    }

    async updateMovie(id: string): Promise<Movie> {
        const existingMovie = await this.movieModel.findByIdAndUpdate(id).exec();
        if (!existingMovie) {
            throw new NotFoundException(`Movie whith ID: ${id} not found`);
        }
        return existingMovie;
    }

    async delete(id: string): Promise<Movie> {
        const existingMovie = await this.movieModel.findByIdAndDelete(id).exec();
        if (!existingMovie) {
            throw new NotFoundException(`Movie whith ID: ${id} not found`);
        }
        return existingMovie;
    }
}