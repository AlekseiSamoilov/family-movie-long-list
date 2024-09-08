import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Group } from "./group.schema";
import { CreateGroupDto } from "./dto/create-group.dto";
import { isValidObjectId, Model, Types } from "mongoose";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { User } from "src/users/user.schema";

@Injectable()
export class GroupService {
    constructor(
        @InjectModel(Group.name) private groupModel: Model<Group>,
        @InjectModel(User.name) private userModel: Model<User>
    ) { }

    async create(createGroupDto: CreateGroupDto, userId: string): Promise<Group> {
        try {
            if (!isValidObjectId(userId)) {
                throw new BadRequestException(`Invalid user id ${userId}`)
            }
            const user = await this.userModel.findById(userId);
            if (!user) {
                throw new NotFoundException(`User with id ${userId} not found`);
            }

            const newGroup = new this.groupModel({
                ...createGroupDto,
                members: [userId],
                sharedWatchlist: []
            });
            const savedGroup = await newGroup.save();
            return savedGroup;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            if (error === 'VaildationError') {
                throw new BadRequestException(error.message);
            }
            throw new InternalServerErrorException(`Failed to create group ${error.message}`);
        }
    }

    async findAll(): Promise<Group[]> {
        try {
            const groups = await this.groupModel.find()
                .populate('users', 'name')
                .populate('movies', 'title')
                .exec();

            if (groups.length === 0) {
                console.log('No groups found');
            }

            return groups;
        } catch (error) {
            throw new InternalServerErrorException(`Failed to find groups ${error.message}`);
        }
    }

    async findOne(id: string): Promise<Group> {
        try {
            if (!isValidObjectId(id)) {
                throw new BadRequestException(`Invalid group id ${id}`);
            }

            const group = await this.groupModel.findById(id)
                .populate('users', 'name')
                .populate('movies', 'title')
                .exec();

            if (!group) {
                throw new NotFoundException(`Group with id ${id} not found`);
            }
            return group;
        } catch (err) {
            if (err instanceof BadRequestException || err instanceof NotFoundException) {
                throw err;
            }
            throw new InternalServerErrorException(`Failed to find group ${err.message}`);
        }
    }

    async update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
        try {
            if (!isValidObjectId(id)) {
                throw new BadRequestException(`Invalid group id ${id}`)
            }

            const updatedGroup = await this.groupModel.findByIdAndUpdate(
                id,
                updateGroupDto,
                { new: true }
            ).exec();

            if (!updatedGroup) {
                throw new NotFoundException(`Group with id ${id} not found`);
            }
            return updatedGroup;
        } catch (err) {
            if (err instanceof BadRequestException || err instanceof NotFoundException) {
                throw err;
            }
            if (err.name === 'ValidationError') {
                throw new BadRequestException(err.message);
            }
            throw new InternalServerErrorException(`Failed to update group ${err.message}`);
        }
    }

    async remove(id: string): Promise<Group> {
        try {
            if (!isValidObjectId(id)) {
                throw new BadRequestException(`Invalid group id ${id}`);
            }
            const deletedGroup = await this.groupModel.findByIdAndDelete(id).exec();
            if (!deletedGroup) {
                throw new NotFoundException(`Group with id ${id} not found`);
            }
            return deletedGroup;
        } catch (err) {
            if (err instanceof BadRequestException || err instanceof NotFoundException) {
                throw err;
            }
            if (err === 'ValidationError') {
                throw new BadRequestException(err.message);
            }
            throw new InternalServerErrorException(`Failed to remove group ${err.message}`);
        }
    }

    async addMember(groupId: string, userId: string): Promise<Group> {
        try {
            if (!isValidObjectId(groupId)) {
                throw new BadRequestException(`Invalid group id ${groupId}`)
            }
            if (!isValidObjectId(userId)) {
                throw new BadRequestException(`Invalid user id ${userId}`)
            }
            const group = await this.groupModel.findById(groupId).exec();
            if (!group) {
                throw new NotFoundException(`Group with id ${groupId} not found`);
            }

            const user = await this.userModel.findById(userId).exec();
            if (!user) {
                throw new NotFoundException(`User with id ${userId} not `);
            }

            const updatedGroup = await this.groupModel.findByIdAndUpdate(
                groupId,
                { $addToSet: { members: userId } },
                { new: true },
            ).exec();

            if (!updatedGroup) {
                throw new InternalServerErrorException('Failed to update group');
            }
            return updatedGroup;
        } catch (error) {
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException(`Failed to add member to the group ${error.message}`);
        }
    }

    async recommendedMovie(groupId: string, movieId: string, userId: string): Promise<Group> {
        return this.groupModel.findByIdAndUpdate(
            groupId,
            { $addToSet: { sharedWatchList: { movieId, recommendedBy: userId } } },
            { new: true }
        ).exec();
    }
}