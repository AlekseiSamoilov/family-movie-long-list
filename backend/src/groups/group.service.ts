import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Group } from "./group.schema";
import { CreateGroupDto } from "./dto/create-group.dto";
import { Model, Types } from "mongoose";
import { UpdateGroupDto } from "./dto/update-group.dto";

@Injectable()
export class GroupService {
    constructor(@InjectModel(Group.name) private groupModel: Model<Group>) { }

    async create(createGroupDto: CreateGroupDto): Promise<Group> {
        const createdGroup = new this.groupModel(createGroupDto);
        return createdGroup.save();
    }

    async findAll(): Promise<Group[]> {
        return this.groupModel.find().populate('users').populate('movies').exec();
    }

    async findOne(id: string): Promise<Group> {
        const group = await this.groupModel.findById(id).populate('users').populate('movies').exec();
        if (!group) {
            throw new NotFoundException(`Group with ID ${id} not found`);
        }
        return group;
    }

    async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
        const updatedGroup = await this.groupModel.findByIdAndUpdate(id, updateGroupDto, { new: true }).exec();
        if (!updatedGroup) {
            throw new NotFoundException(`Group with ID ${id} not found`);
        }
        return updatedGroup;
    }

    async remove(id: string): Promise<Group> {
        const deletedGroup = await this.groupModel.findByIdAndDelete(id).exec();
        if (!deletedGroup) {
            throw new NotFoundException(`Group with ID ${id} not found`);
        }
        return deletedGroup;
    }

    async AddUserToGroup(groupId: string, userId: string): Promise<Group> {
        const group = await this.groupModel.findByIdAndUpdate(
            groupId,
            { $addToSet: { users: new Types.ObjectId(userId) } },
            { new: true }
        ).exec();
        if (!group) {
            throw new NotFoundException(`Group with ID ${groupId} not found`);
        }
        return group;
    }

    async addMovieToGroup(groupId: string, movieId: string): Promise<Group> {
        const group = await this.groupModel.findByIdAndUpdate(
            groupId,
            { $addToSet: { movies: new Types.ObjectId(movieId) } },
            { new: true }
        ).exec();
        if (!group) {
            throw new NotFoundException(`Group with ID ${groupId} not found`);
        }

        return group;
    }
}