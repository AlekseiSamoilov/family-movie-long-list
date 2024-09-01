import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "src/users/users.service";
import * as bcrypt from 'bcrypt';
import { NotFoundError } from "rxjs";

@Injectable()
export class AuthSerivce {
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
        await this.userService.updateUser(user._id, { password: hashedPassword });
        return { message: 'Password successfully reset ' }
    }
}