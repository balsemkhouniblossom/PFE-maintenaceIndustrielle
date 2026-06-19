import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (!user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.usersService.update(
      user._id.toString(),
      {
        last_login: new Date().toISOString(),
      }
    );

    const { password: _, ...result } = user.toObject();
    console.log('EMAIL:', email);
    console.log('USER:', user);
    console.log('PASSWORD EXISTS:', !!user?.password);
    return result;
  }
  async login(user: any) {
    const payload = {
      email: user.email,
      sub: user._id,
      role: user.role,
      user_id: user.user_id
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      token: accessToken,
      user,
    };
  }

  async register(userData: any) {
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(
      userData.password,
      10
    );
    // Create user
    const newUser = await this.usersService.create({
      ...userData,
      password: hashedPassword,
      is_active: true,
    });

    return newUser;
  }
}