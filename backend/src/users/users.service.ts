import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "./user.schema";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { GroupService } from "src/groups/group.service";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private groupService: GroupService
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const createdUser = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
        });
        const savedUser = await createdUser.save();

        await this.groupService.addUserToGroup('defaultGroupId', savedUser._id.toString());

        return savedUser;
    }

    async findAll(): Promise<User[]> {
        return this.userModel.find().exec();
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userModel.findById(id).exec();
        if (!user) {
            throw new NotFoundException(`User with ID: ${id} not found!`);
        }
        return user;
    }

    async findByLogin(login: string): Promise<User | undefined> {
        return this.userModel.findOne({ login }).exec();
    }

    async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const existingUser = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
        if (!existingUser) {
            throw new NotFoundException(`User with ID: ${id} not found!`);
        }
        return existingUser;
    }

    async delete(id: string): Promise<User> {
        const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
        if (!deletedUser) {
            throw new NotFoundException(`User with ID: ${id} not found`);
        }
        return deletedUser;
    }

    async addMovieToWatched(userId: string, movieId: string): Promise<User> {
        const user = await this.userModel.findByIdAndUpdate(
            userId,
            {
                $addToSet: { watchedMovies: movieId },
                $inc: { moviesWatched: 1 }
            },
            { new: true }
        ).exec();
        if (!user) {
            throw new NotFoundException(`User with ID: ${userId} not found`);
        }
        return user;
    }

    async getMoviesForUserInGroup(userId: string, groupId: string): Promise<any> {
        const user = await this.userModel.findById(userId).exec();
        if (!user) {
            throw new NotFoundException(`User with ID: ${userId} not found`);
        }
        const group = await this.groupService.findOne(groupId);
        if (!group) {
            throw new NotFoundException(`Group with ID: ${groupId} not found`);
        }
        return group.movies;
    }
}