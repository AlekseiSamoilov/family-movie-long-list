import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/users.service";
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from "src/users/dto/update-user.dto";

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService
    ) { }

    async validateUser(login: string, password: string): Promise<any> {
        const user = await this.userService.findByLogin(login);
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { username: user.login, sub: user._id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }

    async resetPasswordWithHint(login: string, passwordHint: string, newPassword: string) {
        const user = await this.userService.findByLogin(login);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if (user.passwordHint !== passwordHint) {
            throw new UnauthorizedException('Incorrect password hint');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updateUserDto: UpdateUserDto = { password: hashedPassword }
        await this.userService.updateUser(user._id.toString(), updateUserDto);
        return { message: 'Password successfully reset ' }
    }
}