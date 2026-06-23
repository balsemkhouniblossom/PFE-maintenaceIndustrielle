import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { extname } from 'path';
import { DocumentsService } from './documents.service';
import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
@Controller('documents')
export class DocumentsUploadController {
    constructor(private readonly documentsService: DocumentsService) { }

    private parseTags(input: unknown): string[] {
        if (Array.isArray(input)) {
            return input.map((tag) => String(tag)).filter(Boolean);
        }

        if (input == null || input === '') {
            return [];
        }

        if (typeof input !== 'string') {
            return [String(input)];
        }

        const raw = input.trim();
        if (!raw) {
            return [];
        }

        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
                return parsed.map((tag) => String(tag)).filter(Boolean);
            }

            if (typeof parsed === 'string' && parsed.trim()) {
                return [parsed.trim()];
            }

            return [];
        } catch {
            // Support simple comma-separated tags when client does not send JSON.
            if (raw.includes(',')) {
                return raw
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean);
            }

            throw new BadRequestException('Invalid tags format. Expected JSON array or comma-separated list.');
        }
    }

    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
        }),
    )
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Body() body: any,
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        const fileUrl = `/uploads/${file.filename}`;
        if (!Types.ObjectId.isValid(body.machine_id)) {
            throw new BadRequestException('Invalid machine_id');
        }

        const storedFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;

        return this.documentsService.create({
            document_id: body.document_id,
            machine_id: body.machine_id,
            type_document: body.type_document,
            file_path: `/uploads/${storedFileName}`,
            file_name: file.originalname,
            description: body.description,
            tags: this.parseTags(body.tags),
            uploaded_by: body.uploaded_by,
        });
    }
}