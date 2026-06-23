import { Injectable } from '@nestjs/common';
import { memoryStorage } from 'multer';

@Injectable()
export class FileUploadService {
  createMulterOptions() {
    return {
      storage: memoryStorage(),
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