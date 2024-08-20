import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "./user.schema";
import { UpdateUserDto } from "./dto/update-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const createdUser = new this.userModel((createUserDto));
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

    async findByUserName(username: string): Promise<User | null> {
        // const findedingUser = 
        return this.userModel.findOne({ name: username }).exec();
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
}