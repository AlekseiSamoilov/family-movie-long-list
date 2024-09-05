
import { Test, TestingModule } from "@nestjs/testing";
import { User } from "./user.schema";
import { UsersService } from "./users.service";
import { Model, Types } from "mongoose";
import { getModelToken } from "@nestjs/mongoose";
import { GroupService } from "../groups/group.service";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from 'bcrypt';
import { NotFoundError } from "rxjs";
import { NotFoundException } from "@nestjs/common";

const mockUsersModel = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn()
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
            expect(mockGroupService.addUserToGroup).toHaveBeenCalledWith('defaultGroupId', mockSavedUser._id.toString());
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
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockReturnValue(null),
            } as any);

            await expect(service.findOne('nonexistentid')).rejects.toThrow(NotFoundException);
        });
    });

})
