import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class FileUploadService {
  createMulterOptions() {
    const avatarsDir = join(process.cwd(), 'uploads', 'avatars');
    if (!existsSync(avatarsDir)) {
      mkdirSync(avatarsDir, { recursive: true });
    }

    return {
      storage: diskStorage({
        destination: avatarsDir,
        filename: (_req: any, file: any, cb: any) => {
          const fileExt = extname(file.originalname || '') || '.jpg';
          const filename = `avatar-${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req: any, file: any, cb: any) => {
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
}