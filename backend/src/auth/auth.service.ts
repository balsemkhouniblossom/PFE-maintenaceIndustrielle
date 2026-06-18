import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      // Find user by email - we'll need to add this method to UsersService
      const user = await this.usersService.findByEmail(email);

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if user is active
      if (!user.is_active) {
        throw new UnauthorizedException('Account is deactivated');
      }

      // Verify password
      const storedPassword = user.password_hash || '';
      const isBcryptHash = storedPassword.startsWith('$2');
      const isPasswordValid = isBcryptHash
        ? await bcrypt.compare(password, storedPassword)
        : password === storedPassword;

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }const password = loginDto.password;

      if (!isBcryptHash) {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        await this.usersService.update(user._id.toString(), { password_hash: hashedPassword });
      }

      // Update last login
      await this.usersService.update(user._id.toString(), { last_login: new Date().toISOString() });

      // Return user without password
      const { password_hash, ...result } = user.toObject();
      return result;
    } catch (error) {
      throw error;
    }
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
    const hashedPassword = await bcrypt.hash(userData.password_hash, saltRounds);

    // Create user
    const newUser = await this.usersService.create({
      ...userData,
      password_hash: hashedPassword,
      is_active: true,
    });

    return newUser;
  }
}