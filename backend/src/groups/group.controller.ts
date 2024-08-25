import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { GroupService } from "./group.service";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";

@Controller()
export class GroupController {
    constructor(private readonly groupService: GroupService) { }

    @Post()
    create(@Body() createGroupDto: CreateGroupDto) {
        return this.groupService.create(createGroupDto);
    }

    @Get()
    findAll() {
        return this.groupService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.groupService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
        return this.groupService.update(id, updateGroupDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.groupService.remove(id);
    }

    @Post(':id/users/:userId')
    addUserToGroup(@Param('id') id: string, @Param('userId') userId: string) {
        return this.groupService.AddUserToGroup(id, userId);
    }

    @Post(':id/movies/:movieId')
    addMovieToGroup(@Param('id') id: string, @Param('movieId') movieId: string) {
        return this.groupService.addMovieToGroup(id, movieId);
    }

}