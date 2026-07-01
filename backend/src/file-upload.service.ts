import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import type { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { Request } from 'express';

@Injectable()
export class FileUploadService {
  static createMulterOptions(): MulterOptions {
    const avatarsDir = join(process.cwd(), 'uploads', 'avatars');
    if (!existsSync(avatarsDir)) {
      mkdirSync(avatarsDir, { recursive: true });
    }

    return {
      storage: diskStorage({
        destination: avatarsDir,
        filename: (
          _req: Request,
          file: Express.Multer.File,
          cb: (error: Error | null, filename: string) => void,
        ) => {
          const fileExt = extname(file.originalname || '') || '.jpg';
          const filename = `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
          cb(null, filename);
        },
      }),
      fileFilter: (
        _req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, acceptFile: boolean) => void,
      ) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed!'), false);
        }
      },
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
      },
    };
  }

  createMulterOptions() {
    return FileUploadService.createMulterOptions();
  }
}
