import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";
import { User } from "./user.schema";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) { }

    @Post()
    async create(@Body() сreateUserDto: CreateUserDto) {
        return this.userService.create(сreateUserDto);
    }

    @Get()
    async findAll(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.userService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.userService.updateUser(id, updateUserDto)
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.userService.delete(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('watchlist/:movieId')
    async addTowatchlist(@Param('movieId') movieId: string, @Req() req) {
        return this.userService.addToWatchlist(req.user.userId, movieId)
    }

    @UseGuards(JwtAuthGuard)
    @Post('watched/:movieId')
    async markAsWatched(@Param('movieId') movieId: string, @Body('rating') rating: number, @Req() req) {
        return this.userService.markAsWatched(req.user.userId, movieId, rating);
    }
} 