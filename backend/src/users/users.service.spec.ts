
import { Test, TestingModule } from "@nestjs/testing";
import { User } from "./user.schema";
import { UsersService } from "./users.service";
import { Model, Types } from "mongoose";
import { getModelToken } from "@nestjs/mongoose";
import { GroupService } from "../groups/group.service";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from 'bcrypt';
import { NotFoundException } from "@nestjs/common";

const mockUsersModel = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    findByLogin: jest.fn(),
};

const mockGroupService = {
    addUserToGroup: jest.fn(),
    findOne: jest.fn(),
};

jest.mock('bcrypt', () => ({
    hash: jest.fn().mockResolvedValue('hashedPassword'),
}));

describe('UsersService', () => {
    let service: UsersService;
    let model: Model<User>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getModelToken(User.name),
                    useValue: mockUsersModel,
                },
                {
                    provide: GroupService,
                    useValue: mockGroupService,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
        model = module.get<Model<User>>(getModelToken(User.name))
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new user', async () => {
            const createUserDto: CreateUserDto = {
                name: 'testUser',
                login: 'testLogin',
                password: '123',
                passwordHint: 'testHint',
            };

            const mockSavedUser = {
                ...createUserDto,
                _id: new Types.ObjectId().toString(),
                password: 'hashedPassword',
            };

            mockUsersModel.create.mockResolvedValue(mockSavedUser);

            mockGroupService.addUserToGroup.mockResolvedValue(mockSavedUser);

            const result = await service.create(createUserDto);

            expect(result).toEqual(mockSavedUser);
            expect(mockGroupService.addUserToGroup).toHaveBeenCalledWith(`${createUserDto.name} first group`, mockSavedUser._id.toString());
            expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
            expect(mockUsersModel.create).toHaveBeenCalledWith({
                ...createUserDto,
                password: 'hashedPassword',
            });
        });
    });

    describe('findAll', () => {
        it('should return an array of users', async () => {
            const mockUsers = [{ name: 'user1' }, { name: 'user2' }];

            jest.spyOn(model, 'find').mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockUsers)
            } as any);

            const result = await service.findAll();

            expect(result).toEqual(mockUsers);
            expect(model.find).toHaveBeenCalled();
        });
    });
    describe('findOne', () => {
        it('should return one user by id', async () => {
            const mockUser = { name: 'testUser', _id: 'testId' };

            jest.spyOn(model, 'findById').mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockUser),
            } as any);

            const result = await service.findOne('testId');

            expect(result).toEqual(mockUser);
            expect(model.findById).toHaveBeenCalledWith('testId')
        });

        it('should throw NotFoundExceptoin if user not found', async () => {
            jest.spyOn(model, 'findById').mockReturnValue({
                exec: jest.fn().mockReturnValue(null),
            } as any);

            await expect(service.findOne('nonexistentid')).rejects.toThrow(NotFoundException);
        });
    });

    describe('findByLogin', () => {
        it('should find one user by login', async () => {
            const mockUser = { login: 'testLogin', _id: 'testId' };

            jest.spyOn(model, 'findOne').mockReturnValue({
                exec: jest.fn().mockReturnValue(mockUser),
            } as any);

            const result = await service.findByLogin(mockUser.login);

            expect(result).toEqual(mockUser);
            expect(model.findOne).toHaveBeenCalledWith({ login: mockUser.login })
        });

        it('should throw NotFoundException if user with login from request not found', async () => {
            jest.spyOn(model, 'findOne').mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockReturnValue(null),
            } as any);

            await expect(service.findByLogin('nonexistentlogin')).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateUser', () => {
        it('should update and return user information', async () => {
            const updatedUserDto = { name: 'updatedMovie' }
            const mockUpdatedUser = { _id: 'testId', ...updatedUserDto };

            jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
                exec: jest.fn().mockReturnValue(mockUpdatedUser),
            } as any);

            const result = await service.updateUser('testId', updatedUserDto);

            expect(result).toEqual(mockUpdatedUser);
            expect(model.findByIdAndUpdate).toHaveBeenCalledWith('testId', updatedUserDto, { new: true });
        });

        it('should throw NotFroundException if user for update not found', async () => {
            jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
                exec: jest.fn().mockReturnValue(null),
            } as any);

            await expect(service.updateUser('nonexistentuser', {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('should delete and return user', async () => {
            const deletedUser = { _id: 'testId' };

            jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
                exec: jest.fn().mockReturnValue(deletedUser),
            } as any);

            const result = await service.delete('testId');

            expect(result).toEqual(deletedUser);
            expect(model.findByIdAndDelete).toHaveBeenCalledWith('testId');
        });

        it('should throw NotFoundException if user not found', async () => {
            jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
                exec: jest.fn().mockReturnValue(null),
            } as any);

            await expect(service.delete('nonexistentid')).rejects.toThrow(NotFoundException);
        })
    });

    describe('addMovieToWatch', () => {
        it('should add movie to watchlist', async () => {
            const movieId = 'testMovieId';
            const userId = 'testUserId';
            const mockUser = {
                _id: 'userId',
                watchedMovies: ['firstMovie'],
                moviesWatched: 1,
            };

            const execMock = jest.fn().mockResolvedValue({
                ...mockUser,
                watchedMovies: [...mockUser.watchedMovies, movieId],
                moviesWatched: mockUser.moviesWatched + 1,
            });

            (model.findByIdAndUpdate as jest.Mock).mockReturnValue({ exec: execMock })

            const result = await service.addMovieToWatched(userId, movieId);

            expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
                userId,
                {
                    $addToSet: { watchedMovies: movieId },
                    $inc: { moviesWatched: 1 },
                },
                { new: true }
            );
            expect(execMock).toHaveBeenCalled();
            expect(result.watchedMovies).toContain(movieId);
            expect(result.moviesWatched).toBe(mockUser.moviesWatched + 1);
        });

        it('should throw NotFoundException if user not found', async () => {
            const mockExec = jest.fn().mockResolvedValue(null);
            (model.findByIdAndUpdate as jest.Mock).mockReturnValue({ exec: mockExec });

            await expect(service.addMovieToWatched('nonexistentuserid', 'movieId')).rejects.toThrow(NotFoundException);
        });
    });

})
