import { Model } from "mongoose";
import { Group } from "./group.schema";
import { GroupService } from "./group.service"
import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { CreateGroupDto } from "./dto/create-group.dto";
import { mock } from "node:test";
import { NotFoundException } from "@nestjs/common";
import { exec } from "node:child_process";

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
        findByIdAndRemove: jest.fn(),
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

    it('should_be_defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should_create_a_new_group', async () => {
            const createGroupDto: CreateGroupDto = { name: 'New Group' };
            mockGroupModel.create.mockResolvedValue(mockGroup);

            const result = await service.create(createGroupDto);
            expect(result).toEqual(mockGroup);
            expect(mockGroupModel.create).toHaveBeenCalledWith(createGroupDto);
        });
    });

    describe('findAll', () => {
        it('should_return_an_array_of_groups', async () => {
            mockGroupModel.find.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue([mockGroup]),
                }),
            });

            const result = await service.findAll();
            expect(result).toEqual([mockGroup]);
            expect(mockGroupModel.find).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        it('should_return_a_single_group', async () => {
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

        it('should_throw_NotFoundException_if_group_is_nit_found', async () => {
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
        it('should_update_a_group', async () => {
            const updateGroupDto = { name: 'Updated_Group' };
            mockGroupModel.findByIdAndUpdate.mockResolvedValue({ ...mockGroup, ...updateGroupDto });

            const result = await service.update('test_id', updateGroupDto);
            expect(result).toEqual({ ...mockGroup, ...updateGroupDto });
            expect(mockGroupModel.findByIdAndUpdate).toHaveBeenCalledWith('test_id', updateGroupDto, { new: true });
        });

        it('should_throw_NotFoundException_if_group_to_update_is_not_found', async () => {
            mockGroupModel.findByIdAndUpdate.mockResolvedValue(null);

            await expect(service.update('non_existent_Id', { name: 'Updated_Group' })).rejects.toThrow(NotFoundException)
        });
    });

    describe('remove', () => {
        it('should_remove_a_group', async () => {
            mockGroupModel.findByIdAndRemove.mockResolvedValue(mockGroup);

            const result = await service.remove('test_id');
            expect(result).toEqual(mockGroup);
            expect(mockGroupModel.findByIdAndRemove).toHaveBeenCalledWith('test_id');
        });

        it('should_throw_NotFoundException_if_group_to_remove_not_found', async () => {
            mockGroupModel.findByIdAndRemove.mockResolvedValue(null);

            await expect(service.remove('non_existent_id')).rejects.toThrow(NotFoundException);
        });
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