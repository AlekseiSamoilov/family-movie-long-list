import { Model } from "mongoose";
import { Group } from "./group.schema";
import { GroupService } from "./group.service"
import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { CreateGroupDto } from "./dto/create-group.dto";
import { NotFoundException } from "@nestjs/common";
import { exec } from "child_process";

describe('GroupService', () => {
    let service: GroupService;
    let model: Model<Group>;

    const mockGroup = {
        _id: 'test_id',
        name: "Test_group",
        users: [],
        movies: [],
    };

    const mockGroupModel = {
        create: jest.fn(),
        find: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GroupService,
                {
                    provide: getModelToken(Group.name),
                    useValue: mockGroupModel,
                },
            ],
        }).compile();

        service = module.get<GroupService>(GroupService);
        model = module.get<Model<Group>>(getModelToken(Group.name));
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new group', async () => {
            const createGroupDto: CreateGroupDto = { name: 'New Group' };
            mockGroupModel.create.mockResolvedValue(mockGroup);

            const result = await service.create(createGroupDto);
            expect(result).toEqual(mockGroup);
            expect(mockGroupModel.create).toHaveBeenCalledWith(createGroupDto);
        });
    });

    describe('findAll', () => {
        it('should return an array of groups', async () => {
            const execMock = jest.fn().mockResolvedValue([mockGroup]);
            const populateMock = jest.fn().mockReturnThis();
            mockGroupModel.find.mockReturnValue({
                populate: populateMock,
                exec: execMock,
            });

            const result = await service.findAll();
            expect(result).toEqual([mockGroup]);
            expect(mockGroupModel.find).toHaveBeenCalled();
            expect(populateMock).toHaveBeenCalledWith('users');
            expect(populateMock).toHaveBeenCalledWith('movies')
            expect(execMock).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should return a single group', async () => {
            const execMock = jest.fn().mockResolvedValue(mockGroup);
            const populateMock = jest.fn().mockReturnThis();
            mockGroupModel.findById.mockReturnValue({
                populate: populateMock,
                exec: execMock,
            });

            const result = await service.findOne('someId');
            expect(result).toEqual(mockGroup);
            expect(mockGroupModel.findById).toHaveBeenCalledWith('someId');
            expect(populateMock).toHaveBeenCalledWith('users');
            expect(populateMock).toHaveBeenCalledWith('movies');
            expect(execMock).toHaveBeenCalled();
        });

        it('should throw NotFoundException if group is not found', async () => {
            const execMock = jest.fn().mockResolvedValue(null);
            const populateMock = jest.fn().mockReturnThis();
            mockGroupModel.findById.mockReturnValue({
                populate: populateMock,
                exec: execMock,
            });

            await expect(service.findOne('nonexistentId')).rejects.toThrow(NotFoundException);
            expect(mockGroupModel.findById).toHaveBeenCalledWith('nonexistentId');
            expect(populateMock).toHaveBeenCalledWith('users');
            expect(populateMock).toHaveBeenCalledWith('movies');
            expect(execMock).toHaveBeenCalled();
        });
    });

    describe('update', () => {
        it('should update a group', async () => {
            const updateGroupDto = { name: 'Updated_Group' };
            const updatedMockGroup = { ...mockGroup, ...updateGroupDto };
            const execMock = jest.fn().mockResolvedValue(updatedMockGroup);
            mockGroupModel.findByIdAndUpdate.mockReturnValue({
                exec: execMock
            });

            const result = await service.update('test_id', updateGroupDto);
            expect(result).toEqual(updatedMockGroup);
            expect(mockGroupModel.findByIdAndUpdate).toHaveBeenCalledWith('test_id', updateGroupDto, { new: true });
            expect(execMock).toHaveBeenCalled();
        });

        it('should throw NotFoundException if group to update is not found', async () => {
            const execMock = jest.fn().mockResolvedValue(null);
            mockGroupModel.findByIdAndUpdate.mockReturnValue({
                exec: execMock,
            });

            await expect(service.update('non_existent_id', { name: 'Updated_group' })).rejects.toThrow(NotFoundException);
            expect(execMock).toHaveBeenCalled();
        })
    });

    describe('remove', () => {
        it('should remove a group', async () => {
            const execMock = jest.fn().mockResolvedValue(mockGroup);
            mockGroupModel.findByIdAndDelete.mockReturnValue({ exec: execMock });

            const result = await service.remove('someId');
            expect(result).toEqual(mockGroup);
            expect(mockGroupModel.findByIdAndDelete).toHaveBeenCalledWith('someId');
            expect(execMock).toHaveBeenCalled();
        });

        it('should throw NotFoundException if group to remove not found', async () => {
            const execMock = jest.fn().mockResolvedValue(null);
            mockGroupModel.findByIdAndDelete.mockReturnValue({
                exec: execMock,
            })

            await expect(service.remove('non_existent_id')).rejects.toThrow(NotFoundException);
            expect(execMock).toHaveBeenCalled();
        });
    });

    describe('addUserToGroup', () => {
        it('should add a user to group', async () => {
            const updatedGroup = { ...mockGroup, users: ['userId'] };
            const execMock = jest.fn().mockResolvedValue(updatedGroup);
            mockGroupModel.findByIdAndUpdate.mockReturnValue({ exec: execMock });

            const result = await service.addUserToGroup('groupId', 'userId');
            expect(result).toEqual(updatedGroup);
            expect(mockGroupModel.findByIdAndUpdate).toHaveBeenCalledWith(
                'groupId',
                { $addToSet: { users: 'userId' } },
                { new: true }
            );
            expect(execMock).toHaveBeenCalled();
        });

        it('shoul throw NotFoundException if group is not found', async () => {
            const execMock = jest.fn().mockResolvedValue(null);
            mockGroupModel.findByIdAndUpdate.mockReturnValue({ exec: execMock });

            await expect(service.addUserToGroup('nonexistentId', 'userId')).rejects.toThrow(NotFoundException);

            expect(mockGroupModel.findByIdAndUpdate).toHaveBeenCalledWith(
                'nonexistentId',
                { $addToSet: { users: 'userId' } },
                { new: true }
            )

            expect(execMock).toHaveBeenCalled();
        })
    });

    describe('addMovieToGroup', () => {
        it('should add a movie to a group', async () => {
            const updatedGroup = { ...mockGroup, movies: ['movieId'] };
            const execMock = jest.fn().mockResolvedValue(updatedGroup);
            mockGroupModel.findByIdAndUpdate.mockReturnValue({ exec: execMock });

            const result = await service.addMovieToGroup('groupId', 'movieId');
            expect(result).toEqual(updatedGroup);
            expect(mockGroupModel.findByIdAndUpdate).toHaveBeenCalledWith(
                'groupId',
                { $addToSet: { movies: 'movieId' } },
                { new: true }
            );
            expect(execMock).toHaveBeenCalled();
        });

        it('should throw NotFoundException if group is not found when adding movie', async () => {
            const execMock = jest.fn().mockResolvedValue(null);
            mockGroupModel.findByIdAndUpdate.mockReturnValue({ exec: execMock });

            await expect(service.addMovieToGroup('nonexistentId', 'movieId')).rejects.toThrow(NotFoundException);

            expect(mockGroupModel.findByIdAndUpdate).toHaveBeenCalledWith(
                'nonexistentId',
                { $addToSet: { movies: 'movieId' } },
                { new: true }
            )

            expect(execMock).toHaveBeenCalled();
        });
    });
});