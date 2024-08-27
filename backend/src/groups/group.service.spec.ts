import { Model } from "mongoose";
import { Group } from "./group.schema";
import { GroupService } from "./group.service"
import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { CreateGroupDto } from "./dto/create-group.dto";
import { mock } from "node:test";
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
            mockGroupModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockGroup)
                }),
            });

            const result = await service.findOne('test_id');
            expect(result).toEqual(mockGroup);
            expect(mockGroupModel.findById).toHaveBeenCalledWith('test_id');
        });

        it('should_throw_NotFoundException_if_group_is_nit_found', async () => {
            mockGroupModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(null),
                }),
            });
            await expect(service.findOne('non_existend_Id')).rejects.toThrow(NotFoundException);
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
})