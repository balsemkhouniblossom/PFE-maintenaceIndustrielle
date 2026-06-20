import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
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

    const { password: _, reset_password_token, reset_password_expires, ...result } = user.toObject();
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
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = await this.usersService.create({
      ...userData,
      password: hashedPassword,
      is_active: true,
    });

    return newUser;
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

    let previewUrl: string | undefined;

    if (user) {
      await this.usersService.update(user._id.toString(), {
        reset_password_token: resetToken,
        reset_password_expires: resetExpires,
      } as any);

      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      const locale = process.env.DEFAULT_LOCALE || 'en';
      const resetLink = `${appUrl}/${locale}/auth/reset-password?token=${resetToken}`;

      previewUrl = await this.emailService.sendMail({
        to: user.email,
        subject: 'Reset your password',
        text: `You requested a password reset. Use the link below to reset your password:\n\n${resetLink}\n\nIf you did not request this, ignore this email.`,
        html: `<p>You requested a password reset. Use the link below to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request this, ignore this email.</p>`,
      });
    }

    const response: { message: string; previewUrl?: string; resetToken?: string } = {
      message:
        'If an account exists with that email, a password reset link has been sent.',
    };

    if (previewUrl) {
      response.previewUrl = previewUrl;
    }

    return response;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByResetToken(dto.token);
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.usersService.update(user._id.toString(), {
      password: hashedPassword,
      reset_password_token: null,
      reset_password_expires: null,
    } as any);

    return {
      message: 'Password has been reset successfully',
    };
  }
}