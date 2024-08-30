import { Model } from "mongoose";
import { Group } from "./group.schema";
import { GroupService } from "./group.service"
import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { CreateGroupDto } from "./dto/create-group.dto";
import { NotFoundException } from "@nestjs/common";

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

        // it('should_throw_NotFoundException_if_group_to_remove_not_found', async () => {
        //     mockGroupModel.findByIdAndRemove.mockResolvedValue(null);

        //     await expect(service.remove('non_existent_id')).rejects.toThrow(NotFoundException);
        // });
    });

    describe('addUserToGroup', () => {
        it('should_add_a_user_to_a_group', async () => {
            const updatedGroup = { ...mockGroup, users: ['userId'] };
            mockGroupModel.findByIdAndUpdate.mockResolvedValue(updatedGroup);

            const result = await service.AddUserToGroup('groupId', 'userId');
            expect(result).toStrictEqual(updatedGroup);
            expect(mockGroupModel.findByIdAndUpdate).toHaveBeenCalledWith(
                'groupId',
                { $addToSet: { users: 'userId' } },
                { new: true }
            );
        });

        it('should_throw_NotFoundException_if_group_is_not_found_when_adding_user', async () => {
            mockGroupModel.findByIdAndUpdate.mockResolvedValue(null);

            await expect(service.AddUserToGroup('non_existent_id', 'userId')).rejects.toThrow(NotFoundException);
        });
    });

    describe('addMovieToGroup', () => {
        it('should_add_a_movie_to_a_group', async () => {
            const updatedGroup = { ...mockGroup, movies: ['movieId'] };
            mockGroupModel.findByIdAndUpdate.mockResolvedValue(updatedGroup);

            const result = await service.addMovieToGroup('groupId', 'movieId');
            expect(result).toEqual(updatedGroup);
            expect(mockGroupModel.findByIdAndUpdate).toHaveBeenCalledWith(
                'groupId',
                { $addToSet: { movies: 'movieId' } },
                { new: true }
            );
        });

        it('should_throw_NotFoundException_if_group_is_not_found_when_adding_movie', async () => {
            mockGroupModel.findByIdAndUpdate.mockResolvedValue(null);

            await expect(service.addMovieToGroup('nonexistentId', 'movieId')).rejects.toThrow(NotFoundException);
        });
    });
});