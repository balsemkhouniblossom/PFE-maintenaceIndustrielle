import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { DocumentsService } from './documents.service';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
@Controller('documents')
export class DocumentsUploadController {
    constructor(private readonly documentsService: DocumentsService) { }

    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const uniqueName =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, uniqueName + extname(file.originalname));
                },
            }),
        }),
    )
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
    ) {
        const fileUrl = `/uploads/${file.filename}`;
        if (!Types.ObjectId.isValid(body.machine_id)) {
            throw new BadRequestException('Invalid machine_id');
        }

        return this.documentsService.create({
            document_id: body.document_id,
            machine_id: body.machine_id,
            type_document: body.type_document,
            file_path: fileUrl,
            file_name: file.originalname,
            description: body.description,
            tags: JSON.parse(body.tags || '[]'),
            uploaded_by: body.uploaded_by,
        });
    }
}