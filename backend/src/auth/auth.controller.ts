import { Controller, Request, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { Role } from '../schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.authService.register(createUserDto);
      return {
        message: 'User registered successfully',
        user: {
          _id: (user as any)._id,
          user_id: user.user_id,
          nom_complet: user.nom_complet,
          email: user.email,
          role: Role,
        },
      };
    } catch (error) {
      return {
        message: 'Registration failed',
        error: error.message,
      };
    }
  }
}