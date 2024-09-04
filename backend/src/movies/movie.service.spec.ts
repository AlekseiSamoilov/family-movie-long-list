import { Model, Types, Document } from "mongoose";
import { Movie } from "./movie.schema";
import { MoviesService } from "./movies.service";
import { getModelToken } from "@nestjs/mongoose";
import { GroupService } from "../groups/group.service";
import { Test, TestingModule } from "@nestjs/testing";
import { CreateMovieDto } from "./dto/create-movie.dto";
import { NotFoundException } from "@nestjs/common";
import { exec } from "child_process";

const mockMovieModel = () => ({
    create: jest.fn(),
    find: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
});

const mockGroupService = {
    addMovieToGroup: jest.fn(),
};

describe('MovieService', () => {
    let service: MoviesService;
    let model: Model<Movie>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MoviesService,
                {
                    provide: getModelToken(Movie.name),
                    useFactory: mockMovieModel,
                },
                {
                    provide: GroupService,
                    useValue: mockGroupService,
                },
            ],
        }).compile();

        service = module.get<MoviesService>(MoviesService);
        model = module.get<Model<Movie>>(getModelToken(Movie.name));
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new movie', async () => {
            const createMovieDto: CreateMovieDto = {
                name: 'Test Movie',
                genre: 'Action',
                addedAt: new Date(),
            };

            const userId = new Types.ObjectId().toHexString();
            const groupId = new Types.ObjectId().toHexString();

            const mockSavedMovie = {
                ...createMovieDto,
                _id: new Types.ObjectId().toString(),
                addedBy: new Types.ObjectId(userId),
                group: new Types.ObjectId(groupId),
            };

            (model.create as jest.Mock).mockResolvedValue([mockSavedMovie]);

            mockGroupService.addMovieToGroup.mockResolvedValue({});

            const result = await service.create(createMovieDto, userId, groupId);

            expect(result).toEqual(mockSavedMovie);
            expect(mockGroupService.addMovieToGroup).toHaveBeenCalledWith(groupId, mockSavedMovie._id.toString());
            expect(model.create).toHaveBeenCalledWith([{
                ...createMovieDto,
                addedBy: new Types.ObjectId(userId),
                group: new Types.ObjectId(groupId),
            }]);
        });
    });

    describe('findAll', () => {
        it('should return an array of movies', async () => {
            const mockMovies = [{ name: 'Movie 1' }, { name: 'Movie 2' }];

            jest.spyOn(model, 'find').mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockMovies),
            } as any);

            const result = await service.findAll();

            expect(result).toEqual(mockMovies);
            expect(model.find).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a movie by id', async () => {
            const mockMovie = { name: 'Test movie', _id: 'movie123' };

            jest.spyOn(model, 'findById').mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockMovie),
            } as any);

            const result = await service.findOne('movie123');

            expect(result).toEqual(mockMovie);
            expect(model.findById).toHaveBeenCalledWith('movie123');
        });

        it('should throw NotFoundException if movie is not found', async () => {
            jest.spyOn(model, 'findById').mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(null),
            } as any);

            await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
        })
    });

    describe('updateMovie', () => {
        it('should update and return a movie', async () => {
            const updateMovieDto = { name: 'Updated Movie' };
            const mockUpdatedMovie = { _id: 'movie123', ...updateMovieDto };

            jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockUpdatedMovie),
            } as any);

            const result = await service.updateMovie('movie123', updateMovieDto);

            expect(result).toEqual(mockUpdatedMovie)
            expect(model.findByIdAndUpdate).toHaveBeenCalledWith('movie123', updateMovieDto, { new: true });
        });

        it('should throw NotFoundException if movie to update is not find', async () => {
            jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockReturnValue(null),
            } as any);

            await expect(service.updateMovie('nonexistent', {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('should delete and return a movie', async () => {
            const mockDeleteMovie = { _id: 'movie123', name: 'Deleted Movie' };

            jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockDeleteMovie),
            } as any)

            const result = await service.delete('movie123');

            expect(result).toEqual(mockDeleteMovie);
            expect(model.findByIdAndDelete).toHaveBeenCalledWith('movie123');
        });

        it('should throw NotFoundException if movie to delete is not find', async () => {
            jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockReturnValue(null)
            } as any);

            await expect(service.delete('nonexistent')).rejects.toThrow(NotFoundException);
        });
    });
});