import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Movie } from "./movie.schema";
import { Model } from "mongoose";
import { CreateMovieDto } from "./dto/create-movie.dto";
import { UpdateMovieDto } from "./dto/update-movie.dto";


@Injectable()
export class MoviesService {
    constructor(
        @InjectModel(Movie.name) private movieModel: Model<Movie>,
    ) { }

    async create(createMovieDto: CreateMovieDto, userId: string, groupId: string): Promise<Movie> {
        const newMovie = new this.movieModel({
            ...createMovieDto,
            addedBy: userId,
            ratings: []
        });

        return newMovie.save();
    }

    async findAll(): Promise<Movie[]> {
        return this.movieModel.find().populate('addedBy').populate('group').exec();
    }

    async findOne(id: string): Promise<Movie> {
        const movie = await this.movieModel.findById(id).exec();
        if (!movie) {
            throw new NotFoundException(`Movie whith ID: ${id} not found`);
        }
        return movie;
    }

    async update(id: string, updateMovieDto: UpdateMovieDto): Promise<Movie> {
        const existingMovie = await this.movieModel.findByIdAndUpdate(id, updateMovieDto, { new: true }).exec();
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

    async addRating(movieId: string, userId: string, rating: number): Promise<Movie> {
        return this.movieModel.findByIdAndUpdate(
            movieId,
            { $push: { ratings: { user: userId, rating } } },
            { new: true },
        ).exec();
    }
}