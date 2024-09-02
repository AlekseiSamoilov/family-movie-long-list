import { Body, Controller, Post, Request, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @Post('reset-password')
    async resetPassword(
        @Body('login') login: string,
        @Body('passwordHint') passwordHint: string,
        @Body('newPassword') newPassword: string,
    ) {
        return this.authService.resetPasswordWithHint(login, passwordHint, newPassword)
    }
}