import { Model } from "mongoose";
import { Movie } from "./movie.schema";
import { MoviesService } from "./movies.service";
import { getModelToken } from "@nestjs/mongoose";
import { GroupService } from "../groups/group.service";
import { Test, TestingModule } from "@nestjs/testing";
import { CreateMovieDto } from "./dto/create-movie.dto";
import { NotFoundException } from "@nestjs/common";

const mockMovieModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
};

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
                    useValue: mockMovieModel,
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

            const userId = 'user123';
            const groupId = 'group123';

            const mockSavedMovie = {
                ...createMovieDto,
                _id: 'movie123',
                addedBy: userId,
                group: groupId,
            };

            jest.spyOn(model.prototype, 'save').mockResolvedValue(mockSavedMovie);
            mockGroupService.addMovieToGroup.mockResolvedValue({});

            const result = await service.create(createMovieDto, userId, groupId);

            expect(result).toEqual(mockSavedMovie);
            expect(mockGroupService.addMovieToGroup).toHaveBeenCalledWith(groupId, 'movie123');
        });
    });
    describe('findAll', () => {
        it('should return an array of movies', async () => {
            const mockMovies = [{ name: 'Movie 1' }, { name: 'Movie 2' }];
            jest.spyOn(model, 'find').mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockMovies),
                }),
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
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockMovie),
                }),
            } as any);

            const result = await service.findOne('movie123');

            expect(result).toEqual(mockMovie);
            expect(model.findById).toHaveBeenCalledWith('movie123');
        });

        it('should throw NotFoundException if movie is not found', async () => {
            jest.spyOn(model, 'findById').mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(null),
                }),
            } as any);

            await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
        })
    })

})