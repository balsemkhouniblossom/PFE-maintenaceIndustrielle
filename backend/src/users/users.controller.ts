import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileUploadService } from '../file-upload.service';
import { basename } from 'path';
import type { Request } from 'express';
import { UserDocument } from '../schemas/user.schema';
import { normalizePagination } from '../common/pagination';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private getApiBaseUrl(req?: Request): string {
    return (
      process.env.API_URL ||
      `${req?.protocol || 'http'}://${req?.get('host') || 'localhost:3001'}`
    );
  }

  private toAbsolutePhotoUrl(photo?: string | null, req?: Request): string {
    if (!photo) return '';
    if (/^https?:\/\//i.test(photo)) return photo;

    const normalized = photo.startsWith('/') ? photo : `/${photo}`;
    return `${this.getApiBaseUrl(req)}${normalized}`;
  }

  private sanitizeUser(
    user: UserDocument | null,
    req?: Request,
  ): Record<string, unknown> | null {
    if (!user) return user;
    const plain = user.toObject() as Record<string, unknown>;
    delete plain.password;
    delete plain.refresh_token_hash;
    plain.photo = this.toAbsolutePhotoUrl(
      plain.photo as string | null | undefined,
      req,
    );
    return plain;
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    const created = await this.usersService.create(createUserDto);
    return this.sanitizeUser(created, req);
  }

  @Post('upload-photo')
  @UseInterceptors(
    FileInterceptor('photo', FileUploadService.createMulterOptions()),
  )
  async uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
    @Body('userId') userId?: string,
    @Req() req?: Request,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const photoPath = this.toAbsolutePhotoUrl(
      `/files/uploads/avatars/${basename(file.path)}`,
      req,
    );

    let updatedUser: UserDocument | null = null;
    if (userId) {
      updatedUser = await this.usersService.update(userId, {
        photo: photoPath,
      });
    }

    return {
      success: true,
      photoPath,
      updatedUser: updatedUser
        ? this.sanitizeUser(updatedUser, req)
        : undefined,
      message: 'Photo uploaded successfully',
    };
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pagination = normalizePagination(page, limit);
    const users = await this.usersService.findAll(
      pagination.page,
      pagination.limit,
      pagination.skip,
    );

    return {
      ...users,
      items: users.items.map((user) => this.sanitizeUser(user, req)),
    };
  }

  @Get('total')
  async getUsersTotal() {
    return this.usersService.getUsersTotal();
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const user = await this.usersService.findOne(id);
    return this.sanitizeUser(user, req);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() req: Request,
  ) {
    const updated = await this.usersService.update(id, updateUserDto);
    return this.sanitizeUser(updated, req);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
