import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileUploadService } from '../file-upload.service';
import { extname } from 'path';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly fileUploadService: FileUploadService,
  ) {}

  private sanitizeUser(user: any) {
    if (!user) return user;
    const plain = typeof user.toObject === 'function' ? user.toObject() : { ...user };
    delete plain.password;
    delete plain.refresh_token_hash;
    return plain;
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    const created = await this.usersService.create(createUserDto);
    return this.sanitizeUser(created);
  }

  @Post('upload-photo')
  @UseInterceptors(FileInterceptor('photo', new FileUploadService().createMulterOptions()))
  uploadPhoto(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { success: false, message: 'No file uploaded' };
    }
    const storedPhotoName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
    // Return the file path that can be stored in the database
    return {
      success: true,
      photoPath: `/files/uploads/avatars/${storedPhotoName}`,
      message: 'Photo uploaded successfully'
    };
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return this.sanitizeUser(user);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const updated = await this.usersService.update(id, updateUserDto);
    return this.sanitizeUser(updated);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}