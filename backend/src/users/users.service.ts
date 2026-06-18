import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) { }
  async create(createUserDto: CreateUserDto): Promise<User> {
    const lastUser = await this.userModel
      .findOne({}, {}, { sort: { created_at: -1 } })
      .exec();

    let nextId = 1;

    if (lastUser?.user_id) {
      const match = lastUser.user_id.match(/USER-(\d+)/);
      if (match) {
        nextId = parseInt(match[1]) + 1;
      }
    }

    const userId = `USER-${nextId.toString().padStart(3, '0')}`;

    // 🔐 HASH PASSWORD (IMPORTANT FIX)
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const createdUser = new this.userModel({
      user_id: userId,
      nom_complet: createUserDto.nom_complet,
      email: createUserDto.email,
      role: createUserDto.role,
      is_active: createUserDto.is_active,
      department: (createUserDto as any).department,
      phone: (createUserDto as any).phone,
      photo: createUserDto.photo,

      // ✅ FIX HERE
      password: hashedPassword,
    });

    return createdUser.save();
  }
  async findAll(): Promise<User[]> {
    return this.userModel
      .find()
      .select('-password -refresh_token_hash')
      .exec();
  }

  async findOne(id: string): Promise<any> {
    return this.userModel.findById(id).exec();
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<any> {
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
  }

  async remove(id: string): Promise<any> {
    return this.userModel.findByIdAndDelete(id).exec();
  }
}