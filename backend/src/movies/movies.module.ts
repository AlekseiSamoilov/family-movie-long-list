import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Movie, MovieSchema } from "./movie.schema";
import { MoviesService } from "./movies.service";

@Module({
    imports: [MongooseModule.forFeature([{ name: Movie.name, schema: MovieSchema }])],
    controllers: [MovieController],
    providers: [MoviesService]
})

export class MovieModule { }