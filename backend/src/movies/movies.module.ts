import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Movie, MovieSchema } from "./movie.schema";
import { MoviesService } from "./movies.service";
import { MovieController } from "./movies.controller";

@Module({
    imports: [MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }])],
    controllers: [MovieController],
    providers: [MoviesService]
})

export class MovieModule { }