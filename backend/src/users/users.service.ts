import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "./user.schema";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { GroupService } from "../groups/group.service";
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
            watchList: [],
            watched: [],
            groups: [],
        });

        return createdUser.save();
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
        const userLogin = await this.userModel.findOne({ login }).exec();
        if (!userLogin) {
            throw new NotFoundException('User not found');
        }
        return userLogin;
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

    async addToWatchlist(userId: string, movieId: string): Promise<User> {
        return this.userModel.findByIdAndUpdate(
            userId,
            { $addToSet: { watchList: movieId } },
            { new: true }
        ).exec();
    }

    async markAsWatched(userId: string, movieId: string, rating: number): Promise<User> {
        return this.userModel.findByIdAndUpdate(
            userId,
            {
                $pull: { watchList: movieId },
                $push: { watched: { movieId, rating } }
            },
            { new: true }
        ).exec();
    }
}