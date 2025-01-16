import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './entities/document.entity';
import { FileUploadService } from './file.upload.service';
import { DocumentsController } from './document.controller';
import { DocumentsService } from './document.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [TypeOrmModule.forFeature([Document]), ConfigModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, FileUploadService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
