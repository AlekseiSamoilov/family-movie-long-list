import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Movie } from "./movie.schema";
import { Model, Types } from "mongoose";
import { CreateMovieDto } from "./dto/create-movie.dto";
import { UpdateMovieDto } from "./dto/update-movie.dto";
import { GroupService } from "src/groups/group.service";


@Injectable()
export class MoviesService {
    constructor(
        @InjectModel(Movie.name) private movieModel: Model<Movie>,
        private groupService: GroupService
    ) { }

    async create(createMovieDto: CreateMovieDto, userId: string, groupId: string): Promise<Movie> {
        const newMovie = new this.movieModel({
            ...createMovieDto,
            addedBy: new Types.ObjectId(userId),
            group: new Types.ObjectId(groupId)
        });

        const savedMovie = await newMovie.save();

        await this.groupService.addMovieToGroup(groupId, savedMovie._id.toString());

        return savedMovie;
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

    async updateMovie(id: string, updateMovieDto: UpdateMovieDto): Promise<Movie> {
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

    async findMovieByGroup(groupId: string): Promise<Movie[]> {
        return this.movieModel.find({ group: groupId }).populate('addedBy').exec();
    }
}