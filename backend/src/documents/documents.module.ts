import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { DocumentsController } from './documents.controller';
import { DocumentsUploadController } from './documents-upload.controller';
import { DocumentsService } from './documents.service';

import { DocumentEntity, DocumentSchema } from '../schemas/document.schema';
import { Machine, MachineSchema } from '../schemas/machine.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DocumentEntity.name, schema: DocumentSchema },
      { name: Machine.name, schema: MachineSchema }, // ✅ REQUIRED FIX
    ]),
  ],
  controllers: [DocumentsController, DocumentsUploadController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
